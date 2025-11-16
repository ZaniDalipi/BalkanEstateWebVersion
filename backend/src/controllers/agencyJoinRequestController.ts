import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AgencyJoinRequest from '../models/AgencyJoinRequest';
import Agency from '../models/Agency';
import User, { IUser } from '../models/User';

// Create a join request
export const createJoinRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agencyId, message } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const agentId = String((req.user as IUser)._id);

    // Check if user is an agent
    const user = await User.findById(agentId);
    if (!user || user.role !== 'agent') {
      res.status(403).json({ message: 'Only agents can request to join agencies' });
      return;
    }

    // Check if agent already belongs to an agency
    if (user.agencyId) {
      res.status(400).json({ message: 'You already belong to an agency' });
      return;
    }

    // Check if agency exists
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    // Check for existing pending request
    const existingRequest = await AgencyJoinRequest.findOne({
      agentId,
      agencyId,
      status: 'pending',
    });

    if (existingRequest) {
      res.status(400).json({ message: 'You already have a pending request to this agency' });
      return;
    }

    // Create join request
    const joinRequest = new AgencyJoinRequest({
      agentId,
      agencyId,
      message,
      status: 'pending',
    });

    await joinRequest.save();

    res.status(201).json({
      message: 'Join request sent successfully',
      joinRequest,
    });
  } catch (error) {
    console.error('Error creating join request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get join requests for an agency (for agency owner)
export const getAgencyJoinRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agencyId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = String((req.user as IUser)._id);

    // Check if user owns the agency
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    if (agency.ownerId.toString() !== userId) {
      res.status(403).json({ message: 'Only agency owner can view join requests' });
      return;
    }

    // Get all join requests for this agency
    const joinRequests = await AgencyJoinRequest.find({ agencyId })
      .populate('agentId', 'name email phone avatarUrl licenseNumber totalSalesValue propertiesSold')
      .sort({ requestedAt: -1 });

    res.json({ joinRequests });
  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get join requests for an agent (their own requests)
export const getAgentJoinRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = String((req.user as IUser)._id);

    const joinRequests = await AgencyJoinRequest.find({ agentId: userId })
      .populate('agencyId', 'name logo email phone city country')
      .sort({ requestedAt: -1 });

    res.json({ joinRequests });
  } catch (error) {
    console.error('Error fetching agent join requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a join request
export const approveJoinRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = String((req.user as IUser)._id);

    const joinRequest = await AgencyJoinRequest.findById(requestId);
    if (!joinRequest) {
      res.status(404).json({ message: 'Join request not found' });
      return;
    }

    // Check if user owns the agency
    const agency = await Agency.findById(joinRequest.agencyId);
    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    if (agency.ownerId.toString() !== userId) {
      res.status(403).json({ message: 'Only agency owner can approve requests' });
      return;
    }

    if (joinRequest.status !== 'pending') {
      res.status(400).json({ message: 'This request has already been processed' });
      return;
    }

    // Update agent's agency
    const agent = await User.findById(joinRequest.agentId);
    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }

    // Check if agent already joined another agency
    if (agent.agencyId) {
      res.status(400).json({ message: 'Agent has already joined another agency' });
      return;
    }

    agent.agencyId = joinRequest.agencyId;
    agent.agencyName = agency.name;
    await agent.save();

    // Add agent to agency's agents array
    if (!agency.agents.includes(joinRequest.agentId)) {
      agency.agents.push(joinRequest.agentId);
      agency.totalAgents = agency.agents.length;
      await agency.save();
    }

    // Update join request
    joinRequest.status = 'approved';
    joinRequest.respondedAt = new Date();
    joinRequest.respondedBy = new mongoose.Types.ObjectId(userId);
    await joinRequest.save();

    res.json({
      message: 'Join request approved successfully',
      joinRequest,
    });
  } catch (error) {
    console.error('Error approving join request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a join request
export const rejectJoinRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = String((req.user as IUser)._id);

    const joinRequest = await AgencyJoinRequest.findById(requestId);
    if (!joinRequest) {
      res.status(404).json({ message: 'Join request not found' });
      return;
    }

    // Check if user owns the agency
    const agency = await Agency.findById(joinRequest.agencyId);
    if (!agency) {
      res.status(404).json({ message: 'Agency not found' });
      return;
    }

    if (agency.ownerId.toString() !== userId) {
      res.status(403).json({ message: 'Only agency owner can reject requests' });
      return;
    }

    if (joinRequest.status !== 'pending') {
      res.status(400).json({ message: 'This request has already been processed' });
      return;
    }

    // Update join request
    joinRequest.status = 'rejected';
    joinRequest.respondedAt = new Date();
    joinRequest.respondedBy = new mongoose.Types.ObjectId(userId);
    await joinRequest.save();

    res.json({
      message: 'Join request rejected',
      joinRequest,
    });
  } catch (error) {
    console.error('Error rejecting join request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a join request (by the agent)
export const cancelJoinRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userId = String((req.user as IUser)._id);

    const joinRequest = await AgencyJoinRequest.findById(requestId);
    if (!joinRequest) {
      res.status(404).json({ message: 'Join request not found' });
      return;
    }

    // Check if user is the agent who made the request
    if (joinRequest.agentId.toString() !== userId) {
      res.status(403).json({ message: 'You can only cancel your own requests' });
      return;
    }

    if (joinRequest.status !== 'pending') {
      res.status(400).json({ message: 'Only pending requests can be cancelled' });
      return;
    }

    await joinRequest.deleteOne();

    res.json({ message: 'Join request cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling join request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
