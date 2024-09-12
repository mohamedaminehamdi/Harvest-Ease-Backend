import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, api, newUser } from "./helpers.js";

setup();

test("users can only modify their own account", async () => {
  const alice = await newUser();
  const bob = await newUser();
  const as = { token: alice.token };

  const list = await api("/settings/users", as);
  assert.equal(list.status, 200);
  assert.equal(JSON.stringify(list.body).includes("email"), false);

  assert.equal((await api(`/settings/users/${bob.id}`, { ...as, method: "PUT", body: { oldPassword: "secret1", newPassword: "hacked1" } })).status, 403);
  assert.equal((await api(`/settings/users/${bob.id}/email`, { ...as, method: "PUT", body: { newEmail: "evil@example.com" } })).status, 403);
  assert.equal((await api(`/settings/users/${bob.id}`, { ...as, method: "DELETE" })).status, 403);

  assert.equal((await api(`/settings/users/${alice.id}`, { ...as, method: "PUT", body: { oldPassword: "wrong11", newPassword: "secret2" } })).status, 401);
  assert.equal((await api(`/settings/users/${alice.id}`, { ...as, method: "PUT", body: { oldPassword: "secret1", newPassword: "secret2" } })).status, 200);
  assert.equal((await api("/auth/login", { method: "POST", body: { email: alice.email, password: "secret2" } })).status, 200);
});
