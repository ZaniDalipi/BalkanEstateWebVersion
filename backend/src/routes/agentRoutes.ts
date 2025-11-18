import express from 'express';
import {
  getAgents,
  getAgent,
  getAgentByUserId,
  updateAgentProfile,
  addTestimonial,
  addReview,
} from '../controllers/agentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAgents);
router.get('/:id', getAgent);
router.get('/user/:userId', getAgentByUserId);

// Protected routes
router.put('/profile', protect, updateAgentProfile);
router.post('/:id/reviews', protect, addReview);
router.post('/:id/testimonials', protect, addTestimonial); // Deprecated - use /reviews instead

export default router;
