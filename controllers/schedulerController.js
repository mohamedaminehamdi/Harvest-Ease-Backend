import Event from '../models/event.js';
import moment from 'moment-timezone';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, category, priority, notes } = req.body;
  const userId = req.user?._id || req.body.userId;

  // Validation
  if (!title || !startDate) {
    return res.status(400).json({
      success: false,
      message: "Title and startDate are required",
    });
  }

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title must be a non-empty string",
    });
  }

  const validCategories = ['general', 'planting', 'watering', 'harvesting', 'maintenance'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category",
    });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      message: "Invalid priority",
    });
  }

  const start = moment(startDate);
  const end = endDate ? moment(endDate) : start.clone().add(1, "hour");

  if (!start.isValid() || !end.isValid()) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format",
    });
  }

  if (end.isBefore(start)) {
    return res.status(400).json({
      success: false,
      message: "End date must be after start date",
    });
  }

  const event = new Event({
    userId,
    title,
    description,
    startDate: start.toDate(),
    endDate: end.toDate(),
    category: category || "general",
    priority: priority || "medium",
    notes,
  });

  const saved = await event.save();

  res.status(201).json({
    success: true,
    message: "Event created",
    data: saved,
  });
});

export const getEvents = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.query.userId;
  const { startDate, endDate, category } = req.query;

  let query = { userId };

  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  if (category) query.category = category;

  const events = await Event.find(query).sort({ startDate: 1 });

  res.status(200).json({
    success: true,
    message: "Events retrieved",
    data: events,
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user?._id || req.body.userId;

  // Validate category if provided
  if (updates.category) {
    const validCategories = ['general', 'planting', 'watering', 'harvesting', 'maintenance'];
    if (!validCategories.includes(updates.category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }
  }

  // Validate priority if provided
  if (updates.priority) {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(updates.priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }
  }

  // Validate dates if provided
  if (updates.startDate || updates.endDate) {
    const event = await Event.findById(id);
    const start = updates.startDate ? moment(updates.startDate) : moment(event.startDate);
    const end = updates.endDate ? moment(updates.endDate) : moment(event.endDate);

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (end.isBefore(start)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }
  }

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // Verify user owns the event
  if (event.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this event",
    });
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Event updated",
    data: updatedEvent,
  });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id || req.body.userId;

  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // Verify user owns the event
  if (event.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this event",
    });
  }

  await Event.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Event deleted",
  });
});

  res.status(200).json({
    success: true,
    message: "Event deleted",
  });
});

export const getEventsByDate = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.query.userId;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Date parameter is required",
    });
  }

  const startOfDay = moment(date).startOf("day").toDate();
  const endOfDay = moment(date).endOf("day").toDate();

  const events = await Event.find({
    userId,
    startDate: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ startDate: 1 });

  res.status(200).json({
    success: true,
    message: "Daily events retrieved",
    data: events,
  });
});

  try {
    const events = await Event.find({ userId });
    return res.status(200).json({ events });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Event by ID
const getEventById = async (req, res) => {
  const userId = req.user._id;

  try {
    const event = await Event.findOne({ _id: req.params.id, userId });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error('Error getting event by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Update Event by ID
const updateEventById = async (req, res) => {
  const userId = req.user._id;
  const eventDataToUpdate = req.body;

  try {
    if (eventDataToUpdate.startTime && !moment(eventDataToUpdate.startTime, moment.ISO_8601, true).isValid()) {
      return res.status(400).json({ error: 'Invalid start time format. Use ISO 8601 format.' });
    }

    if (eventDataToUpdate.endTime && !moment(eventDataToUpdate.endTime, moment.ISO_8601, true).isValid()) {
      return res.status(400).json({ error: 'Invalid end time format. Use ISO 8601 format.' });
    }

    const updatedEvent = await Event.findOneAndUpdate({ _id: req.params.id, userId }, eventDataToUpdate, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    console.error('Error updating event by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete Event by ID
const deleteEventById = async (req, res) => {
  const userId = req.user._id;

  try {
    const deletedEvent = await Event.findOneAndDelete({ _id: req.params.id, userId });

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { addEvent, getAllEvents, getEventById, updateEventById, deleteEventById, authenticateToken };