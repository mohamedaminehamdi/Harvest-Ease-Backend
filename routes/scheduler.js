// routes/scheduler.js
import express from 'express';
import { addEvent, getAllEvents, getEventById, updateEventById, deleteEventById } from '../controllers/schedulerController.js';

const router = express.Router();

router.post('/add-event', addEvent);
router.get('/events', getAllEvents);
router.get('/events/:eventId', getEventById);
router.put('/events/:eventId', updateEventById);
router.delete('/events/:eventId', deleteEventById);

export default router;