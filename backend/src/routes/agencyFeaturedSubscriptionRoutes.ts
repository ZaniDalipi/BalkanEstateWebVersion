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
import { auth, optionalAuth } from '../middleware/auth';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// Agency owner routes
router.post('/agencies/:agencyId/featured-subscription', auth, createFeaturedSubscription);
router.get('/agencies/:agencyId/featured-subscription', optionalAuth, getFeaturedSubscription);
router.delete('/agencies/:agencyId/featured-subscription', auth, cancelFeaturedSubscription);
router.post('/agencies/:agencyId/featured-subscription/confirm-payment', auth, confirmPayment);
router.post('/agencies/:agencyId/featured-subscription/apply-coupon', auth, applyCoupon);

// Admin routes
router.get('/admin/featured-subscriptions', auth, isAdmin, getAllFeaturedSubscriptions);
router.post('/admin/featured-subscriptions/check-expired', auth, isAdmin, checkExpiredSubscriptions);

export default router;
