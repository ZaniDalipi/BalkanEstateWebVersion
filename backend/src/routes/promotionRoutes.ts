import express from 'express';
import {
  promoteProperty,
  getMyPromotions,
  cancelPromotion,
  getFeaturedProperties,
} from '../controllers/promotionController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedProperties);

// Protected routes
router.post('/', protect(), promoteProperty);
router.get('/', protect(), getMyPromotions);
router.delete('/:id', protect(), cancelPromotion);

export default router;
