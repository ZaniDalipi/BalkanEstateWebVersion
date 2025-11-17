import express from 'express';
import {
  createAgency,
  getAgencies,
  getAgency,
  updateAgency,
  addAgentToAgency,
  removeAgentFromAgency,
  getFeaturedAgencies,
} from '../controllers/agencyController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAgencies);
router.get('/featured/rotation', getFeaturedAgencies);
router.get('/:idOrSlug', getAgency);

// Protected routes
router.post('/', protect, createAgency);
router.put('/:id', protect, updateAgency);
router.post('/:id/agents', protect, addAgentToAgency);
router.delete('/:id/agents/:agentId', protect, removeAgentFromAgency);

export default router;
