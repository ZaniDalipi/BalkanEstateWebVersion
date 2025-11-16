import express from 'express';
import {
  createJoinRequest,
  getAgencyJoinRequests,
  getAgentJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  cancelJoinRequest,
} from '../controllers/agencyJoinRequestController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a join request
router.post('/', authenticateToken, createJoinRequest);

// Get all join requests for the current agent
router.get('/my-requests', authenticateToken, getAgentJoinRequests);

// Get all join requests for an agency (agency owner only)
router.get('/agency/:agencyId', authenticateToken, getAgencyJoinRequests);

// Approve a join request (agency owner only)
router.put('/:requestId/approve', authenticateToken, approveJoinRequest);

// Reject a join request (agency owner only)
router.put('/:requestId/reject', authenticateToken, rejectJoinRequest);

// Cancel a join request (agent only)
router.delete('/:requestId', authenticateToken, cancelJoinRequest);

export default router;
