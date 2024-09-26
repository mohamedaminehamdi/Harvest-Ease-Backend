import { test, after } from "node:test";
import assert from "node:assert/strict";
import { setup, api, newUser } from "./helpers.js";

setup();

const realFetch = globalThis.fetch;
after(() => {
  globalThis.fetch = realFetch;
  delete process.env.GOOGLE_GEN_AI_KEY;
});

// Fake Gemini: records requests, replies with `reply` or fails when it's null
const stubGemini = (reply) => {
  const calls = [];
  globalThis.fetch = async (url, opts) => {
    if (!String(url).startsWith("https://generativelanguage.googleapis.com/")) return realFetch(url, opts);
    calls.push({ url: String(url), body: JSON.parse(opts.body) });
    if (reply === null) return new Response(JSON.stringify({ error: { message: "quota" } }), { status: 400 });
    return Response.json({ candidates: [{ content: { role: "model", parts: [{ text: reply }] }, finishReason: "STOP", index: 0 }] });
  };
  return calls;
};

const ask = (token, message) => api("/chatbot/query", { method: "POST", token, body: { message } });

test("without a Gemini key the bot uses keyword answers and keeps per-user history", async () => {
  const alice = await newUser();
  const bob = await newUser();

  const res = await ask(alice.token, "How much water do tomatoes need?");
  assert.equal(res.status, 200);
  assert.match(res.body.data.response, /Water your plants/);

  assert.equal((await ask(alice.token, "   ")).status, 400);
  assert.equal((await ask(alice.token, "x".repeat(2001))).status, 400);

  const history = await api("/chatbot/history", { token: alice.token });
  assert.deepEqual(history.body.data.map((m) => m.role), ["user", "bot"]);
  assert.equal((await api("/chatbot/history", { token: bob.token })).body.data.length, 0);

  assert.equal((await api("/chatbot/history", { method: "DELETE", token: alice.token })).status, 200);
  assert.equal((await api("/chatbot/history", { token: alice.token })).body.data.length, 0);
});

test("with a Gemini key the bot answers via Gemini with recent history, falling back on errors", async () => {
  process.env.GOOGLE_GEN_AI_KEY = "test-key";
  const alice = await newUser();

  let calls = stubGemini("Plant garlic in autumn.");
  assert.equal((await ask(alice.token, "When do I plant garlic?")).body.data.response, "Plant garlic in autumn.");
  assert.match(calls[0].url, /models\/gemini-2\.5-flash:generateContent/);

  await ask(alice.token, "And onions?");
  // The second request carries the first exchange as context
  assert.deepEqual(calls[1].body.contents.map((c) => c.role), ["user", "model", "user"]);

  calls = stubGemini(null);
  const fallback = await ask(alice.token, "Any pest tips?");
  assert.equal(fallback.status, 200);
  assert.match(fallback.body.data.response, /neem oil/);
});
