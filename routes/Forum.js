import express from "express";
const router = express.Router();
import { createComment, addReply, getCommentsByTweet, updateComment, deleteComment } from '../controllers/forum/commentscontroller.js';
import { deleteTweet, updateTweet, createTweet, likeTweet, getAllTweets, getTweetById } from "../controllers/forum/tweetscont.js";
import Comment from '../models/comments.js'
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
router.post('/tweets', createTweet);
router.put('/tweets/:id/likes', likeTweet);
router.post('/tweets/:id/like', likeTweet);

router.get('/tweets', getAllTweets);
router.put('/tweets/:id', updateTweet);

router.delete('/tweets/:id', deleteTweet);

router.get('/tweets/:id', getTweetById);

router.get('/tweets/:tweetId/comments', getCommentsByTweet);
router.post('/tweets/:tweetId/comments', createComment);
router.post('/comments', createComment);
router.put('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);
router.put('/comments/:commentId/replies', addReply);

export default router;
