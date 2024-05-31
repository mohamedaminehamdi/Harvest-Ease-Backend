import Event from '../models/event.js';
import moment from 'moment';

// Function to add an event
const addEvent = async (req, res) => {
  const { eventId, title, description, startTime, endTime } = req.body;

  if (!eventId || !title || !startTime || !endTime) {
    return res.status(400).json({ error: 'Please provide all required fields: eventId, title, startTime, endTime' });
  }

  try {
    const existingEvent = await Event.findOne({ eventId });
    if (existingEvent) {
      return res.status(400).json({ error: 'Event with this eventId already exists' });
    }

    if (!moment(startTime, 'HH:mm', true).isValid() || !moment(endTime, 'HH:mm', true).isValid()) {
      return res.status(400).json({ error: 'Invalid start time or end time format. Use HH:MM format.' });
    }

    const parsedStartTime = moment(startTime, 'HH:mm').toDate();
    const parsedEndTime = moment(endTime, 'HH:mm').toDate();

    const newEvent = new Event({ eventId, title, description, startTime: parsedStartTime, endTime: parsedEndTime });
    await newEvent.save();

    return res.status(201).json({ message: 'Event added successfully', event: newEvent });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    return res.status(200).json({ events });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Event by ID
const getEventById = async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const event = await Event.findOne({ eventId });

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
  try {
    const eventId = parseInt(req.params.eventId);
    const eventDataToUpdate = req.body;

    const updatedEvent = await Event.findOneAndUpdate({ eventId }, eventDataToUpdate, { new: true });

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
  try {
    const eventId = parseInt(req.params.eventId);
    const deletedEvent = await Event.findOneAndDelete({ eventId });

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { addEvent, getAllEvents, getEventById, updateEventById, deleteEventById };
