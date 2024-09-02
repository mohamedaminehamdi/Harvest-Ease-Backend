// routes/scheduler.js
import express from 'express';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent } from '../controllers/schedulerController.js';

const router = express.Router();


router.post('/add-event', createEvent);
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);

export default router;
