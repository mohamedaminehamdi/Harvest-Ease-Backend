import Tweet from '../../models/tweets.js';
import { asyncHandler } from '../../middlewares/errorHandler.js';

export const createTweet = asyncHandler(async (req, res) => {
  const { content, image } = req.body;
  const userId = req.user?._id || req.body.userId;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Content is required",
    });
  }

  const newTweet = new Tweet({
    userId,
    content,
    image,
    likes: [],
    comments: [],
  });

  const savedTweet = await newTweet.save();

  res.status(201).json({
    success: true,
    message: "Tweet created",
    data: savedTweet,
  });
});

export const getAllTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find()
    .populate("userId", "name picturePath")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Tweets retrieved",
    data: tweets,
  });
});

export const getTweetById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tweet = await Tweet.findById(id)
    .populate("userId", "name picturePath")
    .populate("comments");

  if (!tweet) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Tweet retrieved",
    data: tweet,
  });
});

export const updateTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, image } = req.body;

  const tweet = await Tweet.findByIdAndUpdate(
    id,
    { content, image },
    { new: true, runValidators: true }
  );

  if (!tweet) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Tweet updated",
    data: tweet,
  });
});

export const deleteTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tweet = await Tweet.findByIdAndDelete(id);

  if (!tweet) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Tweet deleted",
  });
});

export const likeTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || req.body.userId;

  const tweet = await Tweet.findById(id);

  if (!tweet) {
    return res.status(404).json({
      success: false,
      message: "Tweet not found",
    });
  }

  const isLiked = tweet.likes.includes(userId);

  if (isLiked) {
    tweet.likes = tweet.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    tweet.likes.push(userId);
  }

  await tweet.save();

  res.status(200).json({
    success: true,
    message: isLiked ? "Like removed" : "Tweet liked",
    data: tweet,
  });
});