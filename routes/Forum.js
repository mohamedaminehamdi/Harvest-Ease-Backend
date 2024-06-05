import express from "express";
const router = express.Router();
import { createComment, addReply } from '../controllers/forum/commentscontroller.js';
import { getAllComments, deleteTweet, updateTweet, createTweet ,getAllTweets,updateLikes } from "../controllers/forum/tweetsCont.js";
import Comment from '../models/comments.js'
import Tweet from "../models/tweets.js";
import User from "../models/user.js"
router.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find(); 
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//  Route to create a new tweet
router.post('/tweets', async (req, res) => {
  createTweet(req, res);
});
router.put('/tweets/:tweetId/likes', updateLikes);

router.get('/tweets', async (req, res) => {
  try {
    // Fetch tweets and populate the owner's name from the User model
    const tweets = await Tweet.find().populate('owner', 'name');
    // Prepare the response data
    const response = tweets.map(tweet => ({
      content: tweet.content,
      ownerName: tweet.owner.name,
      likes: tweet.likes,
      comments: tweet.comments,
      createdAt: tweet.createdAt,
      updatedAt: tweet.updatedAt,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.put('/tweets/:tweetId', async (req, res) => {
  updateTweet(req, res);
});

router.delete('/tweets/:tweetId', async (req, res) => {
  deleteTweet(req, res);
});

router.get('/tweets/:tweetId', async (req, res) => {
  const tweetId = req.params.tweetId;

  try {
    const tweet = await Tweet.findById(tweetId).populate('comments'); // Populate comments

    if (!tweet) {
      return res.status(404).json({ error: 'Tweet not found' });
    }

    res.json(tweet); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/tweets/:tweetId/comments', async (req, res) => {
  createComment(req, res);
});
router.put('/comments/:commentId/replies', async (req, res) => {
  addReply(req, res);
});

export default router;
