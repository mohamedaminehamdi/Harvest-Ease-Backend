import mongoose from 'mongoose';

export const EVENT_CATEGORIES = ['general', 'planting', 'watering', 'harvesting', 'maintenance'];
export const EVENT_PRIORITIES = ['low', 'medium', 'high'];

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 2000 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    category: { type: String, enum: EVENT_CATEGORIES, default: 'general' },
    priority: { type: String, enum: EVENT_PRIORITIES, default: 'medium' },
    notes: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

eventSchema.index({ userId: 1, startDate: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
