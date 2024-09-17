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
