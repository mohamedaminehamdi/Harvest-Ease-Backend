import mongoose from "mongoose";

const resourceUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resourceName: {
      type: String,
      required: true,
      enum: ["water", "fertilizer", "pesticide", "seed", "equipment", "labor"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      enum: ["liters", "kg", "units", "hours"],
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    action: {
      type: String,
      enum: ["addition", "usage", "replacement"],
      default: "usage",
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

resourceUsageSchema.index({ userId: 1, date: -1 });

const ResourceUsage = mongoose.model("ResourceUsage", resourceUsageSchema);

export default ResourceUsage;
