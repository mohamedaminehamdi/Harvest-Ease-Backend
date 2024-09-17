import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
      maxlength: 1000,
    },
    tweetId: {
      type: Schema.Types.ObjectId,
      ref: 'Tweet', // Tweet this comment belongs to
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Author of the comment
      required: true,
    },
    replies: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
