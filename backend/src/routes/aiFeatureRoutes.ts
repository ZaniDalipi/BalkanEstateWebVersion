import express from 'express';
import { checkAiUsage, trackAiUsage } from '../controllers/aiFeatureController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protected routes for AI feature usage tracking
router.get('/check-usage', protect, checkAiUsage);
router.post('/track-usage', protect, trackAiUsage);

export default router;
