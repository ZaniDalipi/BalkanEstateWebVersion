import express from 'express';
import {
  createSubscription,
  getUserSubscriptions,
  getCurrentSubscription,
  getSubscriptionById,
  cancelSubscription,
  restoreSubscription,
  getSubscriptionEvents,
  getSubscriptionPayments,
  verifySubscription,
} from '../controllers/subscriptionController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Subscription management
router.post('/', createSubscription);
router.get('/', getUserSubscriptions);
router.get('/current', getCurrentSubscription); // Must be before /:id to avoid conflict
router.get('/:id', getSubscriptionById);
router.post('/:id/cancel', cancelSubscription);
router.post('/:id/restore', restoreSubscription);
router.post('/:id/verify', verifySubscription);

// Subscription details
router.get('/:id/events', getSubscriptionEvents);
router.get('/:id/payments', getSubscriptionPayments);

export default router;
