import { test } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middlewares/auth.js";

process.env.JWT_SECRET = "test-secret";

const run = (authorization) => {
  const req = { header: () => authorization };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json() { return this; },
  };
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
};

test("rejects missing, malformed and forged tokens", () => {
  const none = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ _id: "abc" })).toString("base64url");

  for (const header of [undefined, "garbage", "Bearer garbage", `Bearer ${none}.${body}.`,
    `Bearer ${jwt.sign({ _id: "abc" }, "wrong-secret")}`]) {
    const { res, nextCalled } = run(header);
    assert.equal(res.statusCode, 401, String(header));
    assert.equal(nextCalled, false);
  }
});

test("accepts a valid token and sets req.user", () => {
  const { req, nextCalled } = run(`Bearer ${jwt.sign({ _id: "abc" }, "test-secret")}`);
  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { _id: "abc" });
});
