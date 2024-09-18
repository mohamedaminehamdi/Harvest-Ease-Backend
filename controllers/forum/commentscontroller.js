import Comment from '../../models/comments.js';
import Tweet from '../../models/tweets.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

export const createComment = asyncHandler(async (req, res) => {
  // POST /tweets/:tweetId/comments or POST /comments with { tweetId }
  const tweetId = req.params.tweetId || req.body.tweetId;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Content is required",
    });
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found",
    });
  }

  const savedComment = await new Comment({ content, tweetId, userId }).save();

  // Keep the tweet's comment list in sync
  tweet.comments.push(savedComment._id);
  await tweet.save();

  res.status(201).json({
    success: true,
    message: "Comment created",
    data: savedComment,
  });
});

export const getCommentsByTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const comments = await Comment.find({ tweetId })
    .populate("userId", "name picturePath")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Comments retrieved",
    data: comments,
  });
});

export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Content is required",
    });
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  // Verify user owns the comment
  if (comment.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this comment",
    });
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    { content },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Comment updated",
    data: updatedComment,
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  // Verify user owns the comment
  if (comment.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this comment",
    });
  }

  await Comment.findByIdAndDelete(id);

  // Remove comment from tweet's comments array
  await Tweet.findByIdAndUpdate(
    comment.tweetId,
    { $pull: { comments: id } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Comment deleted",
  });
});

export const addReply = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { reply } = req.body;

  if (!reply || reply.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Reply is required",
    });
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $push: { replies: reply } },
    { new: true }
  );

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Reply added",
    data: comment,
  });
});
