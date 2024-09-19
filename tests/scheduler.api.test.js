import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, api, newUser } from "./helpers.js";

setup();

test("events: create, validate, list per user, by date, owner-only changes", async () => {
  const alice = await newUser();
  const bob = await newUser();
  const as = (user, opts = {}) => ({ token: user.token, ...opts });

  const created = await api("/scheduler/events", as(alice, {
    method: "POST",
    body: { title: "Water tomatoes", startDate: "2024-09-20T08:00:00Z", category: "watering", priority: "high" },
  }));
  assert.equal(created.status, 201);
  const id = created.body.data._id;
  assert.equal(created.body.data.endDate, "2024-09-20T09:00:00.000Z"); // defaults to one hour

  const legacy = await api("/Farm-scheduler/add-event", as(alice, { method: "POST", body: { title: "Harvest", startDate: "2024-09-22T08:00:00Z" } }));
  assert.equal(legacy.status, 201);

  assert.equal((await api("/scheduler/events", as(alice, { method: "POST", body: { title: "x", startDate: "2024-09-20", category: "party" } }))).status, 400);
  assert.equal((await api("/scheduler/events", as(alice, { method: "POST", body: { title: "x", startDate: "2024-09-20", endDate: "2024-09-19" } }))).status, 400);

  assert.equal((await api("/scheduler/events", as(alice))).body.data.length, 2);
  assert.equal((await api("/scheduler/events", as(bob))).body.data.length, 0);
  assert.equal((await api("/scheduler/events/by-date?date=2024-09-20", as(alice))).body.data.length, 1);

  assert.equal((await api(`/scheduler/events/${id}`, as(bob, { method: "PUT", body: { title: "mine now" } }))).status, 403);
  assert.equal((await api(`/scheduler/events/${id}`, as(bob, { method: "DELETE" }))).status, 403);

  const updated = await api(`/scheduler/events/${id}`, as(alice, { method: "PUT", body: { title: "Water peppers", userId: bob.id } }));
  assert.equal(updated.body.data.title, "Water peppers");
  assert.equal(updated.body.data.userId, alice.id); // body can't reassign ownership

  assert.equal((await api(`/scheduler/events/${id}`, as(alice, { method: "DELETE" }))).status, 200);
  assert.equal((await api(`/scheduler/events/${id}`, as(alice, { method: "PUT", body: { title: "gone" } }))).status, 404);
});
