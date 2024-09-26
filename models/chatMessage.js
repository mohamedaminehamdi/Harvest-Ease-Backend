import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "bot"], required: true },
    content: { type: String, required: true, maxlength: 10000 },
  },
  { timestamps: true }
);

// _id order is insertion order, so a question always sorts before its answer
chatMessageSchema.index({ userId: 1, _id: -1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
