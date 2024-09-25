import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "crypto";
import jwt from "jsonwebtoken";
import { setup, api } from "./helpers.js";

const clerk = generateKeyPairSync("rsa", { modulusLength: 2048 });
const attacker = generateKeyPairSync("rsa", { modulusLength: 2048 });
process.env.CLERK_JWT_KEY = clerk.publicKey.export({ type: "spki", format: "pem" }).replace(/\n/g, "\\n");
process.env.CLERK_SECRET_KEY = "sk_test_dummy";

// Stand-in for the Clerk Backend API: user ids map to { email, verified }
const clerkUsers = {
  user_alice: { email: "Alice@Example.com", verified: true },
  user_mallory: { email: "mallory@example.com", verified: false },
};
const realFetch = globalThis.fetch;
before(() => {
  globalThis.fetch = async (url, opts) => {
    const match = String(url).match(/^https:\/\/api\.clerk\.com\/v1\/users\/(.+)$/);
    if (!match) return realFetch(url, opts);
    assert.equal(opts.headers.Authorization, "Bearer sk_test_dummy");
    const u = clerkUsers[match[1]];
    if (!u) return new Response("{}", { status: 404 });
    return Response.json({
      first_name: "Alice",
      last_name: "Farmer",
      primary_email_address_id: "em_1",
      email_addresses: [{ id: "em_1", email_address: u.email, verification: { status: u.verified ? "verified" : "unverified" } }],
    });
  };
});
after(() => {
  globalThis.fetch = realFetch;
});

setup();

const sessionToken = (sub, key = clerk.privateKey, extra = {}) =>
  jwt.sign({ sub, azp: "http://localhost:3000", ...extra }, key, { algorithm: "RS256", expiresIn: "1m" });
const sync = (token, body = {}) => api("/auth/sync-user", { method: "POST", body, ...(token && { token }) });

test("sync-user trusts only verified Clerk sessions and Clerk's email", async () => {
  assert.equal((await sync(null, { email: "victim@example.com", name: "x" })).status, 401);
  assert.equal((await sync(sessionToken("user_alice", attacker.privateKey))).status, 401);
  assert.equal((await sync(sessionToken("user_alice", clerk.privateKey, { azp: "https://evil.example" }))).status, 401);
  assert.equal((await sync(jwt.sign({ sub: "user_alice" }, "not-the-key"))).status, 401);
  assert.equal((await sync(sessionToken("user_mallory"))).status, 403);

  const first = await sync(sessionToken("user_alice"), { email: "victim@example.com", name: "Alice F." });
  assert.equal(first.status, 200);
  assert.equal(first.body.user.email, "alice@example.com");
  assert.equal(first.body.user.name, "Alice F.");

  const again = await sync(sessionToken("user_alice"));
  assert.equal(again.body.user._id, first.body.user._id);

  const me = await api("/users/profile", { token: again.body.token });
  assert.equal(me.body.user.email, "alice@example.com");
});
