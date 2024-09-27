import { test } from "node:test";
import assert from "node:assert/strict";
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
