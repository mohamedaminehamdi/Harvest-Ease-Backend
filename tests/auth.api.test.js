import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import { setup, api, newUser } from "./helpers.js";

setup();

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

test("protected routes require a valid token", async () => {
  assert.equal((await api("/settings/users")).status, 401);
  assert.equal((await api("/Forum/tweets", { token: "nope" })).status, 401);
});

test("register and login", async () => {
  const user = await newUser();
  assert.ok(user.token);

  const ok = await api("/auth/login", { method: "POST", body: { email: user.email, password: user.password } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.user.password, undefined);

  const wrong = await api("/auth/login", { method: "POST", body: { email: user.email, password: "nope99" } });
  const unknown = await api("/auth/login", { method: "POST", body: { email: "nobody@example.com", password: "nope99" } });
  assert.equal(wrong.status, 401);
  assert.deepEqual(wrong.body, unknown.body);

  assert.equal((await api("/auth/login", { method: "POST" })).status, 400);
});

test("avatar uploads are images only and renamed", async () => {
  const form = new FormData();
  form.append("name", "Bob");
  form.append("email", `bob${Date.now()}@example.com`);
  form.append("password", "secret1");
  form.append("picture", new Blob([png], { type: "image/png" }), "../../evil.png");
  const res = await api("/auth/register", { method: "POST", body: form });
  assert.equal(res.status, 201);
  const pic = res.body.user.picturePath;
  assert.match(pic, /^[0-9a-f-]{36}\.png$/);

  const served = await api(`/assets/${pic}`);
  assert.equal(served.headers.get("content-type"), "image/png");
  fs.rmSync(`public/assets/${pic}`);

  const html = new FormData();
  html.append("name", "Eve");
  html.append("email", `eve${Date.now()}@example.com`);
  html.append("password", "secret1");
  html.append("picture", new Blob(["<script>alert(1)</script>"], { type: "text/html" }), "x.html");
  const bad = await api("/auth/register", { method: "POST", body: html });
  assert.equal(bad.status, 400);
  assert.equal(bad.body.stack, undefined);
});

test("oversized bodies are rejected", async () => {
  const res = await api("/auth/login", { method: "POST", body: { email: "a".repeat(2_000_000), password: "x" } });
  assert.equal(res.status, 413);
});
