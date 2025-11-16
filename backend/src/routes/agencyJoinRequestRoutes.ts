import express from 'express';
import {
  createJoinRequest,
  getAgencyJoinRequests,
  getAgentJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
} from '../controllers/agencyJoinRequestController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Create a join request
router.post('/', protect, createJoinRequest);

// Get all join requests for the current agent
router.get('/my-requests', protect, getAgentJoinRequests);

// Get all join requests for an agency (agency owner only)
router.get('/agency/:agencyId', protect, getAgencyJoinRequests);

// Approve a join request (agency owner only)
router.put('/:requestId/approve', protect, approveJoinRequest);

// Reject a join request (agency owner only)
router.put('/:requestId/reject', protect, rejectJoinRequest);

// Cancel a join request (agent only)
router.delete('/:requestId', protect, cancelJoinRequest);

export default router;
