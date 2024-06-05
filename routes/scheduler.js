// routes/scheduler.js
import express from 'express';
import { addEvent, getAllEvents, getEventById, updateEventById, deleteEventById , authenticateToken} from '../controllers/schedulerController.js';

const router = express.Router();


router.post('/add-event', authenticateToken, addEvent);
router.get('/events', authenticateToken, getAllEvents);
router.get('/events/:id', authenticateToken, getEventById);
router.put('/events/:id', authenticateToken, updateEventById);
router.delete('/events/:id', authenticateToken, deleteEventById);

export default router;