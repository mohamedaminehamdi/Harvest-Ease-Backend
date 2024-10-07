import { test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { setup, api } from "./helpers.js";

setup();

test("/healthz reports database state without auth", async () => {
  const up = await api("/healthz");
  assert.equal(up.status, 200);
  assert.deepEqual(up.body, { status: "ok", db: "up" });

  await mongoose.disconnect();
  const down = await api("/healthz");
  assert.equal(down.status, 503);
  assert.equal(down.body.db, "down");
});
