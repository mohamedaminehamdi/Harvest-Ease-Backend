import  Tweet from '../../models/tweets.js'; 
import mongoose from 'mongoose'
export async function createTweet  (req, res)  {
  try {
    const { content, ownerId } = req.body;

     if (!mongoose.Types.ObjectId.isValid(ownerId)) {
       return res.status(400).json({ error: 'Invalid owner ID format' });
    }

    const newTweet = new Tweet({ content, owner: ownerId });
    await newTweet.save();

    res.status(201).json({
      "msg":"succeed"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export async function updateTweet (req, res) {
  try {
    const tweetId = req.params.tweetId;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(400).json({ error: 'Invalid tweet ID format' });
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true }); // Return updated tweet

    if (!updatedTweet) {
      return res.status(404).json({ error: 'Tweet not found' });
    }

    res.json(updatedTweet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export async function deleteTweet (req, res) {
  try {
    const tweetId = req.params.tweetId;

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(400).json({ error: 'Invalid tweet ID format' });
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
      return res.status(404).json({ error: 'Tweet not found' });
    }

    res.json({ message: 'Tweet deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export async function getAllComments (req, res) {
    try {
      const comments = await Comment.find(); // Fetch all comments
      res.json(comments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  export async function getAllTweets(req, res) {
    try {
      // Fetch all tweets (replace with specific filtering if needed)
      const tweets = await Tweet.find();
  
      res.json(tweets);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  export async function updateLikes(req, res) {
    const { tweetId, liked } = req.body; // Expect "liked" to be true or false
  
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      return res.status(400).json({ error: 'Invalid tweet ID format' });
    }
  
    const update = {
      $inc: { likes: liked ? 1 : -1 } // Increment or decrement likes based on "liked" value
    };
  
    try {
      const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, update, { new: true });
  
      if (!updatedTweet) {
        return res.status(404).json({ error: 'Tweet not found' });
      }
  
      res.json(updatedTweet); // Respond with the updated tweet
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }