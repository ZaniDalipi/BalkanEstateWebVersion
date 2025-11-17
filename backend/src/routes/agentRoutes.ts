import express from 'express';
import {
  getAgents,
  getAgent,
  getAgentByUserId,
  updateAgentProfile,
  addTestimonial,
} from '../controllers/agentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes - agent profiles are public information
router.get('/', getAgents);
router.get('/:id', getAgent);
router.get('/user/:userId', getAgentByUserId);

// Protected routes
router.put('/profile', protect, updateAgentProfile);
router.post('/:id/testimonials', protect, addTestimonial);

export default router;
