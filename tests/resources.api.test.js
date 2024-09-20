import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, api, newUser } from "./helpers.js";

setup();

test("resource usage: log, summarise, validate, owner-only changes", async () => {
  const alice = await newUser();
  const bob = await newUser();

  const water = await api("/resources/usage", { method: "POST", token: alice.token, body: { resourceName: "water", quantity: 120, unit: "liters", cost: 3.5 } });
  assert.equal(water.status, 201);
  const free = await api("/resources/usage", { method: "POST", token: alice.token, body: { resourceName: "labor", quantity: 0, unit: "hours", cost: 0 } });
  assert.equal(free.status, 201);

  for (const body of [
    { resourceName: "gold", quantity: 1, unit: "kg", cost: 1 },
    { resourceName: "seed", quantity: "5", unit: "kg", cost: 1 },
    { resourceName: "seed", quantity: 5, unit: "kg", cost: -1 },
  ]) {
    assert.equal((await api("/resources/usage", { method: "POST", token: alice.token, body })).status, 400);
  }

  const mine = await api("/resources/usage", { token: alice.token });
  assert.equal(mine.body.data.length, 2);
  assert.equal(mine.body.summary.totalCost, 3.5);
  assert.equal((await api("/resources/usage", { token: bob.token })).body.data.length, 0);

  const id = water.body.data._id;
  assert.equal((await api(`/resources/usage/${id}`, { method: "PUT", token: bob.token, body: { cost: 0 } })).status, 403);
  assert.equal((await api(`/resources/usage/${id}`, { method: "DELETE", token: bob.token })).status, 403);
  assert.equal((await api(`/resources/usage/${id}`, { method: "PUT", token: alice.token, body: { cost: 4 } })).body.data.cost, 4);
  assert.equal((await api(`/resources/usage/${id}`, { method: "DELETE", token: alice.token })).status, 200);
});
