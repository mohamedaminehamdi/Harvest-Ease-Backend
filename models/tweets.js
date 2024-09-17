import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const tweetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Author of the tweet
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Users who liked the tweet
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

export default mongoose.model('Tweet', tweetSchema);
