import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true // Remove leading/trailing whitespace
  },
  tweet: {
    type: Schema.Types.ObjectId,
    ref: 'Tweet', // Reference the Tweet model for the associated Tweet
    required: true
  },
  replies: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now // Set timestamp on creation
  },
  updatedAt: {
    type: Date,
    default: Date.now // Set timestamp on update
  }
});

commentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Comment', commentSchema);
