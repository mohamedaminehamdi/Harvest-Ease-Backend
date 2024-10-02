import { test } from "node:test";
import assert from "node:assert/strict";
import { setup, api, newUser } from "./helpers.js";

setup();

test("tweets: create, list, like, and only the author can edit or delete", async () => {
  const alice = await newUser({ name: "Alice" });
  const bob = await newUser({ name: "Bob" });

  const created = await api("/forum/tweets", { method: "POST", token: alice.token, body: { content: "First harvest!" } });
  assert.equal(created.status, 201);
  const id = created.body.data._id;
  assert.equal(created.body.data.userId, alice.id);

  const list = await api("/forum/tweets", { token: bob.token });
  assert.equal(list.status, 200);
  assert.equal(list.body.data[0].userId.name, "Alice");

  const liked = await api(`/forum/tweets/${id}/likes`, { method: "PUT", token: bob.token });
  assert.deepEqual(liked.body.data.likes, [bob.id]);
  const unliked = await api(`/forum/tweets/${id}/likes`, { method: "PUT", token: bob.token });
  assert.deepEqual(unliked.body.data.likes, []);

  assert.equal((await api(`/forum/tweets/${id}`, { method: "PUT", token: bob.token, body: { content: "hijacked" } })).status, 403);
  assert.equal((await api(`/forum/tweets/${id}`, { method: "DELETE", token: bob.token })).status, 403);
  assert.equal((await api(`/forum/tweets/${id}`, { method: "PUT", token: alice.token, body: { content: "Edited" } })).body.data.content, "Edited");
  assert.equal((await api(`/forum/tweets/${id}`, { method: "DELETE", token: alice.token })).status, 200);
  assert.equal((await api(`/forum/tweets/${id}`, { token: alice.token })).status, 404);
});

test("comments are attached to their tweet", async () => {
  const alice = await newUser();
  const { body } = await api("/forum/tweets", { method: "POST", token: alice.token, body: { content: "Ask me anything" } });
  const tweetId = body.data._id;

  const comment = await api(`/forum/tweets/${tweetId}/comments`, { method: "POST", token: alice.token, body: { content: "Nice" } });
  assert.equal(comment.status, 201);
  assert.equal(comment.body.data.userId, alice.id);

  const tweet = await api(`/forum/tweets/${tweetId}`, { token: alice.token });
  assert.equal(tweet.body.data.comments[0].content, "Nice");
});

test("comment API: list, create via body, author-only edit and delete", async () => {
  const alice = await newUser();
  const bob = await newUser();
  const { body } = await api("/forum/tweets", { method: "POST", token: alice.token, body: { content: "Tomatoes or peppers?" } });
  const tweetId = body.data._id;

  assert.equal((await api(`/forum/tweets/${tweetId}/like`, { method: "POST", token: bob.token })).body.data.likes.length, 1);

  const created = await api("/forum/comments", { method: "POST", token: bob.token, body: { tweetId, content: "Peppers" } });
  assert.equal(created.status, 201);
  const commentId = created.body.data._id;

  const missing = await api("/forum/comments", { method: "POST", token: bob.token, body: { tweetId: "000000000000000000000000", content: "?" } });
  assert.equal(missing.status, 404);

  const list = await api(`/forum/tweets/${tweetId}/comments`, { token: alice.token });
  assert.equal(list.body.data.length, 1);
  assert.equal(list.body.data[0].userId._id, bob.id);

  assert.equal((await api(`/forum/comments/${commentId}`, { method: "PUT", token: alice.token, body: { content: "x" } })).status, 403);
  assert.equal((await api(`/forum/comments/${commentId}`, { method: "PUT", token: bob.token, body: { content: "Peppers!" } })).body.data.content, "Peppers!");
  assert.equal((await api(`/forum/comments/${commentId}`, { method: "DELETE", token: alice.token })).status, 403);
  assert.equal((await api(`/forum/comments/${commentId}`, { method: "DELETE", token: bob.token })).status, 200);
  assert.equal((await api(`/forum/tweets/${tweetId}`, { token: alice.token })).body.data.comments.length, 0);
});

test("tweets are paginated newest first", async () => {
  const { token } = await newUser();
  for (let i = 1; i <= 5; i++) await api("/forum/tweets", { method: "POST", token, body: { content: `post ${i}` } });

  const first = await api("/forum/tweets?limit=2", { token });
  assert.deepEqual(first.body.data.map((t) => t.content), ["post 5", "post 4"]);
  assert.equal(first.body.pagination.limit, 2);
  assert.ok(first.body.pagination.total >= 5);

  const second = await api("/forum/tweets?limit=2&page=2", { token });
  assert.deepEqual(second.body.data.map((t) => t.content), ["post 3", "post 2"]);

  assert.equal((await api("/forum/tweets?limit=1000", { token })).body.pagination.limit, 50);
  assert.equal((await api("/forum/tweets?page=-3&limit=abc", { token })).body.pagination.page, 1);
});
