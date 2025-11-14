import express from 'express';
import {
  createPaymentIntent,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
} from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Payment intent creation (protected)
router.post('/create-intent', protect, createPaymentIntent);

// Subscription status (protected)
router.get('/subscription-status', protect, getSubscriptionStatus);

// Cancel subscription (protected)
router.post('/cancel-subscription', protect, cancelSubscription);

// Stripe webhook (public but verified by Stripe signature)
// Note: This route needs raw body, so it should use express.raw() middleware
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
