import mongoose from 'mongoose';
const Schema = mongoose.Schema;

import Comment from './comments.js'; // Import the Comment schema

const tweetSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true // Remove leading/trailing whitespace
  },
  comments: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // Array of Comment model references
    default: []
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference the User model for the content owner
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Set timestamp on creation
  },
  updatedAt: {
    type: Date,
    default: Date.now // Set timestamp on update
  },
  likes: {
    type: Number,
    default: 0 // Initialize with 0 likes
  },
});

tweetSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Tweet', tweetSchema);
