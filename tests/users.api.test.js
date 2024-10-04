import { test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { setup, api, newUser } from "./helpers.js";

setup();

test("profiles: full for yourself, public fields for others, owner-only updates", async () => {
  const alice = await newUser({ name: "Alice" });
  const bob = await newUser({ name: "Bob" });

  const own = await api("/users/profile", { token: alice.token });
  assert.equal(own.body.user.email, alice.email);
  assert.equal(own.body.user.password, undefined);

  const other = await api(`/users/profile/${alice.id}`, { token: bob.token });
  assert.equal(other.body.user.name, "Alice");
  assert.equal(other.body.user.email, undefined);

  const updated = await api(`/users/profile/${alice.id}`, { method: "PUT", token: alice.token, body: { farmName: "Green Acres", bio: "Tomatoes", role: "admin" } });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.user.farmName, "Green Acres");
  assert.equal(updated.body.user.role, "farmer"); // role is not an editable field

  assert.equal((await api(`/users/profile/${alice.id}`, { method: "PUT", token: bob.token, body: { bio: "pwned" } })).status, 403);
  assert.equal((await api(`/users/profile/${alice.id}`, { method: "PUT", token: alice.token, body: { website: "ftp://x" } })).status, 400);

  const changed = await api("/users/change-password", { method: "POST", token: alice.token, body: { oldPassword: "secret1", newPassword: "secret2" } });
  assert.equal(changed.status, 200);
  assert.equal((await api("/auth/login", { method: "POST", body: { email: alice.email, password: "secret2" } })).status, 200);
});

test("emails with long TLDs register and log in case-insensitively", async () => {
  const email = `grower${Date.now()}@farm.agency`;
  const res = await api("/auth/register", { method: "POST", body: { name: "Grower", email, password: "secret1" } });
  assert.equal(res.status, 201);
  assert.equal((await api("/auth/login", { method: "POST", body: { email: email.toUpperCase(), password: "secret1" } })).status, 200);
  assert.equal((await api("/auth/register", { method: "POST", body: { name: "Again", email: email.toUpperCase(), password: "secret1" } })).status, 400);
});

test("schema validation errors are 400s, not 500s", async () => {
  const res = await api("/auth/register", { method: "POST", body: { name: "N".repeat(51), email: `long${Date.now()}@example.com`, password: "secret1" } });
  assert.equal(res.status, 400);
  assert.match(res.body.errors[0], /50 characters/);
});

test("deleting an account removes the user's data everywhere", async () => {
  const alice = await newUser();
  const bob = await newUser();
  const post = (user, path, body) => api(path, { method: "POST", token: user.token, body });

  const aliceTweet = (await post(alice, "/forum/tweets", { content: "Alice's tweet" })).body.data._id;
  const bobTweet = (await post(bob, "/forum/tweets", { content: "Bob's tweet" })).body.data._id;
  await post(bob, `/forum/tweets/${aliceTweet}/comments`, { content: "Bob on Alice" });
  await post(alice, `/forum/tweets/${bobTweet}/comments`, { content: "Alice on Bob" });
  await post(alice, `/forum/tweets/${bobTweet}/like`);
  await post(alice, "/scheduler/events", { title: "Plant", startDate: "2024-10-04T08:00:00Z" });
  await post(alice, "/resources/usage", { resourceName: "water", quantity: 1, unit: "liters", cost: 1 });
  await post(alice, "/chatbot/query", { message: "hi" });

  assert.equal((await api("/users/profile", { method: "DELETE", token: alice.token })).status, 200);
  assert.equal((await api("/auth/login", { method: "POST", body: { email: alice.email, password: alice.password } })).status, 401);

  const tweet = (await api(`/forum/tweets/${bobTweet}`, { token: bob.token })).body.data;
  assert.deepEqual(tweet.likes, []);
  assert.deepEqual(tweet.comments, []);
  assert.equal((await api(`/forum/tweets/${aliceTweet}/comments`, { token: bob.token })).body.data.length, 0);
  assert.equal((await api("/forum/comments", { token: bob.token })).body.length, 0);

  const models = ["Event", "ResourceUsage", "ChatMessage"].map((name) => mongoose.model(name));
  for (const Model of models) assert.equal(await Model.countDocuments({ userId: alice.id }), 0, Model.modelName);
});
