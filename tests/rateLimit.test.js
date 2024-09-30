import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit } from "../middlewares/rateLimit.js";

const hit = (limiter, ip) => {
  const res = {
    statusCode: 200,
    headers: {},
    set(k, v) { this.headers[k] = v; return this; },
    status(code) { this.statusCode = code; return this; },
    json() { return this; },
  };
  let passed = false;
  limiter({ ip }, res, () => { passed = true; });
  return { passed, res };
};

test("allows max requests per window per IP, then 429 with Retry-After", (t) => {
  t.mock.timers.enable({ apis: ["Date", "setInterval"] });
  const limiter = rateLimit({ windowMs: 60_000, max: 2 });

  assert.equal(hit(limiter, "1.1.1.1").passed, true);
  assert.equal(hit(limiter, "1.1.1.1").passed, true);
  const blocked = hit(limiter, "1.1.1.1");
  assert.equal(blocked.passed, false);
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(blocked.res.headers["Retry-After"], "60");

  assert.equal(hit(limiter, "2.2.2.2").passed, true); // other clients unaffected

  t.mock.timers.tick(60_000);
  assert.equal(hit(limiter, "1.1.1.1").passed, true); // new window
});
