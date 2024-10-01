import { test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { setup, api, newUser } from "./helpers.js";

setup();

test("operator payloads and non-string fields are rejected, not executed", async () => {
  await newUser();
  const login = await api("/auth/login", { method: "POST", body: { email: { $gt: "" }, password: { $gt: "" } } });
  assert.equal(login.status, 400);

  const register = await api("/auth/register", { method: "POST", body: { name: 42, email: "n@example.com", password: "secret1" } });
  assert.equal(register.status, 400);

  // Even if an operator object reached a query, sanitizeFilter treats it as a literal value,
  // which can't be cast to a string, instead of matching every user
  const User = mongoose.model("User");
  await assert.rejects(User.findOne({ email: { $ne: null } }), { name: "CastError" });
});

test("our own date-range filters still work", async () => {
  const { token } = await newUser();
  await api("/resources/usage", { method: "POST", token, body: { resourceName: "seed", quantity: 1, unit: "kg", cost: 2 } });
  const today = new Date().toISOString().slice(0, 10);
  assert.equal((await api(`/resources/usage?startDate=${today}`, { token })).body.data.length, 1);
  assert.equal((await api("/resources/usage?endDate=2000-01-01", { token })).body.data.length, 0);

  await api("/scheduler/events", { method: "POST", token, body: { title: "Sow", startDate: "2024-10-01T09:00:00Z" } });
  assert.equal((await api("/scheduler/events?startDate=2024-09-30&endDate=2024-10-02", { token })).body.data.length, 1);
  assert.equal((await api("/scheduler/events?startDate=2025-01-01", { token })).body.data.length, 0);
});
