import Comment from '../../models/comments.js';
import mongoose from 'mongoose'
export async function createComment(req, res) {
  try {
    const tweetId = req.params.tweetId;
    const { content } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(400).json({ error: 'Invalid tweet ID format' });
    }

    const newComment = new Comment({ content, tweet: tweetId }); 
    await newComment.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to add a reply to a comment
export async function addReply(req, res) {
  try {
    const commentId = req.params.commentId;
    const { reply } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID format' });
    }

    const comment = await Comment.findByIdAndUpdate(commentId, {
      $push: { replies: reply }
    }, { new: true });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}