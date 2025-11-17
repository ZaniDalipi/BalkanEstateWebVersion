import express from 'express';
import {
  aiSearchChat,
  aiPropertyInsights,
  aiNeighborhoodInsights,
  getFeatureUsageStats,
} from '../controllers/aiController';
import { protect } from '../middleware/auth';
import { checkFeatureLimit } from '../middleware/checkFeatureUsage';

const router = express.Router();

// All AI endpoints require authentication
router.use(protect);

// AI Search Chat - with usage limit check
router.post('/search/chat', checkFeatureLimit('ai_search'), aiSearchChat);

// AI Property Insights - with usage limit check
router.post('/property/insights', checkFeatureLimit('ai_property_insights'), aiPropertyInsights);

// AI Neighborhood Insights - with usage limit check
router.post('/neighborhood/insights', checkFeatureLimit('neighborhood_insights'), aiNeighborhoodInsights);

// Get feature usage statistics
router.get('/usage/stats', getFeatureUsageStats);

export default router;
