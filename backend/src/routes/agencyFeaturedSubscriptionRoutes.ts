import express from 'express';
import {
  createFeaturedSubscription,
  getFeaturedSubscription,
  cancelFeaturedSubscription,
  confirmPayment,
  applyCoupon,
  checkExpiredSubscriptions,
  getAllFeaturedSubscriptions,
} from '../controllers/agencyFeaturedSubscriptionController';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Agency owner routes
router.post('/agencies/:agencyId/featured-subscription', protect, createFeaturedSubscription);
router.get('/agencies/:agencyId/featured-subscription', getFeaturedSubscription);
router.delete('/agencies/:agencyId/featured-subscription', protect, cancelFeaturedSubscription);
router.post('/agencies/:agencyId/featured-subscription/confirm-payment', protect, confirmPayment);
router.post('/agencies/:agencyId/featured-subscription/apply-coupon', protect, applyCoupon);

// Admin routes
router.get('/admin/featured-subscriptions', protect, requireAdmin, getAllFeaturedSubscriptions);
router.post('/admin/featured-subscriptions/check-expired', protect, requireAdmin, checkExpiredSubscriptions);

export default router;
