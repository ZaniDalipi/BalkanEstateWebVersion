import express from 'express';
import {
  createPaymentIntent,
  processPayment,
  getSubscriptionStatus,
  cancelSubscription,
} from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Payment intent creation (protected)
router.post('/create-intent', protect, createPaymentIntent);

// Process payment (protected) - mock payment processing
router.post('/process', protect, processPayment);

// Subscription status (protected)
router.get('/subscription-status', protect, getSubscriptionStatus);

// Cancel subscription (protected)
router.post('/cancel-subscription', protect, cancelSubscription);

export default router;
