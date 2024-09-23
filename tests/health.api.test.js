import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, api, newUser } from "./helpers.js";

setup();

test("plant health analysis and plant info", async () => {
  const { token } = await newUser();

  const analysis = await api("/health/analyze", { method: "POST", token, body: { imageUrl: "https://example.com/leaf.jpg", plantType: "tomato" } });
  assert.equal(analysis.status, 200);
  assert.ok(Array.isArray(analysis.body.data.recommendations));
  assert.equal((await api("/health/analyze", { method: "POST", token, body: { imageUrl: "javascript:alert(1)" } })).status, 400);

  assert.equal((await api("/health/plant-info/Tomato", { token })).body.data.name, "Tomato");
  assert.equal((await api("/health/plant-info/constructor", { token })).body.data.name, "constructor");
  assert.equal((await api("/health/analyze", { method: "POST", body: { imageUrl: "https://example.com/a.jpg" } })).status, 401);
});
