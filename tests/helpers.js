import { before, after } from "node:test";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET ??= "test-secret";
// Every test request comes from 127.0.0.1, so lift the auth limit
process.env.AUTH_RATE_LIMIT ??= "10000";

let mongo, server, base;

// Starts an in-memory MongoDB and the app on a random port for the calling test file
export const setup = () => {
  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
    const { default: app } = await import("../app.js");
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(async () => {
    server?.close();
    await mongoose.disconnect();
    await mongo?.stop();
  });
};

export const api = async (path, { method = "GET", body, token, headers = {} } = {}) => {
  const isForm = body instanceof FormData;
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body && !isForm && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: isForm ? body : body && JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, body: json, headers: res.headers };
};

let count = 0;
export const newUser = async (overrides = {}) => {
  const user = { name: "Test User", email: `user${Date.now()}${count++}@example.com`, password: "secret1", ...overrides };
  const { body } = await api("/auth/register", { method: "POST", body: user });
  return { ...user, id: body.user._id, token: body.token };
};
