import Comment from '../../models/comments.js';
import Tweet from '../../models/tweets.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

export const createComment = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;
  const { content } = req.body;
  const userId = req.user?._id || req.body.userId;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Content is required",
    });
  }

  const newComment = new Comment({ 
    content, 
    tweetId, 
    userId,
  });
  
  const savedComment = await newComment.save();

  // Update tweet's comment count
  await Tweet.findByIdAndUpdate(
    tweetId,
    { $push: { comments: savedComment._id } },
    { new: true }
  );

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
  const userId = req.user?._id || req.body.userId;

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
  const userId = req.user?._id || req.body.userId;

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
