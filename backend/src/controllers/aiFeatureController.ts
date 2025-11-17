import { Request, Response } from 'express';
import UsageTracking from '../models/UsageTracking';
import User from '../models/User';
import { USAGE_LIMITS } from '../middleware/checkUsageLimit';

/**
 * Check if user can use AI features and return usage info
 * @route GET /api/ai-features/check-usage
 * @access Private
 */
export const checkAiUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const userId = (req.user as any).id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPremium = user.canAccessPremiumFeatures();
    const usage = await UsageTracking.getTodayUsage(userId);

    const limits = isPremium ? USAGE_LIMITS.PREMIUM : USAGE_LIMITS.FREE;

    const usageInfo = {
      isPremium,
      limits,
      currentUsage: {
        aiSearch: usage.aiSearchCount,
        aiDescription: usage.aiDescriptionCount,
        neighborhoodInsights: usage.neighborhoodInsightsCount,
      },
      remaining: isPremium
        ? null // Unlimited
        : {
            aiSearch: Math.max(0, limits.aiSearch - usage.aiSearchCount),
            aiDescription: Math.max(0, limits.aiDescription - usage.aiDescriptionCount),
            neighborhoodInsights: Math.max(0, limits.neighborhoodInsights - usage.neighborhoodInsightsCount),
          },
      canUse: {
        aiSearch: isPremium || usage.aiSearchCount < limits.aiSearch,
        aiDescription: isPremium || usage.aiDescriptionCount < limits.aiDescription,
        neighborhoodInsights: isPremium || usage.neighborhoodInsightsCount < limits.neighborhoodInsights,
      },
    };

    res.json(usageInfo);
  } catch (error: any) {
    console.error('Error checking AI usage:', error);
    res.status(500).json({ message: 'Error checking usage', error: error.message });
  }
};

/**
 * Track AI feature usage after successful use
 * @route POST /api/ai-features/track-usage
 * @access Private
 */
export const trackAiUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { featureType } = req.body;

    if (!featureType || !['aiSearch', 'aiDescription', 'neighborhoodInsights'].includes(featureType)) {
      res.status(400).json({ message: 'Invalid feature type' });
      return;
    }

    const userId = (req.user as any).id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPremium = user.canAccessPremiumFeatures();

    // Check if user has exceeded limit (for free users)
    if (!isPremium) {
      const usage = await UsageTracking.getTodayUsage(userId);
      const limits = USAGE_LIMITS.FREE;

      const currentUsage = usage[`${featureType}Count` as keyof typeof usage] as number || 0;
      const limit = limits[featureType as keyof typeof limits];

      if (currentUsage >= limit) {
        res.status(429).json({
          message: 'Daily usage limit reached',
          error: 'USAGE_LIMIT_EXCEEDED',
          featureType,
          currentUsage,
          limit,
          isPremium: false,
          upgradeMessage: `You've reached your daily limit of ${limit} ${featureType} requests. Upgrade to Premium for unlimited access!`,
          upgradeCta: 'Upgrade to Premium for just €1.50/year',
        });
        return;
      }
    }

    // Increment usage counter
    await UsageTracking.incrementUsage(userId, featureType);

    // Get updated usage info
    const usage = await UsageTracking.getTodayUsage(userId);
    const limits = isPremium ? USAGE_LIMITS.PREMIUM : USAGE_LIMITS.FREE;

    const usageInfo = {
      isPremium,
      limits,
      currentUsage: {
        aiSearch: usage.aiSearchCount,
        aiDescription: usage.aiDescriptionCount,
        neighborhoodInsights: usage.neighborhoodInsightsCount,
      },
      remaining: isPremium
        ? null
        : {
            aiSearch: Math.max(0, limits.aiSearch - usage.aiSearchCount),
            aiDescription: Math.max(0, limits.aiDescription - usage.aiDescriptionCount),
            neighborhoodInsights: Math.max(0, limits.neighborhoodInsights - usage.neighborhoodInsightsCount),
          },
    };

    res.json({
      success: true,
      message: 'Usage tracked successfully',
      usage: usageInfo,
    });
  } catch (error: any) {
    console.error('Error tracking AI usage:', error);
    res.status(500).json({ message: 'Error tracking usage', error: error.message });
  }
};
