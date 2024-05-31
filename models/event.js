import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  eventId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true }
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
