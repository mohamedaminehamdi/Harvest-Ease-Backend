import Event from '../models/event.js';
import moment from 'moment';
import jwt from 'jsonwebtoken';

// Middleware to authenticate and extract user ID from token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};


// Function to add an event
const addEvent = async (req, res) => {
  const { title, description, startTime, endTime } = req.body;
  const userId = req.user._id;

  if (!title || !startTime || !endTime) {
    return res.status(400).json({ error: 'Please provide all required fields: title, startTime, endTime' });
  }

  try {
    if (!moment(startTime, moment.ISO_8601, true).isValid() || !moment(endTime, moment.ISO_8601, true).isValid()) {
      return res.status(400).json({ error: 'Invalid start time or end time format. Use ISO 8601 format.' });
    }

    const parsedStartTime = moment(startTime).toDate();
    const parsedEndTime = moment(endTime).toDate();

    const newEvent = new Event({ title, description, startTime: parsedStartTime, endTime: parsedEndTime, userId });
    await newEvent.save();

    return res.status(201).json({ message: 'Event added successfully', event: newEvent });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to get all events
const getAllEvents = async (req, res) => {
  const userId = req.user._id;

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