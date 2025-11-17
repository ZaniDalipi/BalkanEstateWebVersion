import { Request, Response, NextFunction } from 'express';
import UsageTracking from '../models/UsageTracking';
import User from '../models/User';

// Define daily limits for free tier users
export const USAGE_LIMITS = {
  FREE: {
    aiSearch: 5, // 5 AI searches per day
    aiDescription: 2, // 2 AI descriptions per day
    neighborhoodInsights: 3, // 3 neighborhood insights per day
    propertyInsights: 3, // 3 property insights views per day
    agentInsights: 3, // 3 agent insights views per day
  },
  PREMIUM: {
    // Unlimited for premium users (set to high number)
    aiSearch: 999999,
    aiDescription: 999999,
    neighborhoodInsights: 999999,
    propertyInsights: 999999,
    agentInsights: 999999,
  },
};

export interface UsageLimitRequest extends Request {
  user?: {
    id: string;
    isSubscribed?: boolean;
    canAccessPremiumFeatures?: () => boolean;
  };
}

/**
 * Middleware to check if user has exceeded daily usage limit for a specific feature
 * @param featureType - Type of feature to check usage for
 */
export const checkUsageLimit = (
  featureType: 'aiSearch' | 'aiDescription' | 'neighborhoodInsights' | 'propertyInsights' | 'agentInsights'
) => {
  return async (req: UsageLimitRequest, res: Response, next: NextFunction) => {
    try {
      // If no user is authenticated, allow but don't track
      if (!req.user || !req.user.id) {
        return next();
      }

      const userId = req.user.id;

      // Get user to check premium status
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Premium users have unlimited access
      const isPremium = user.canAccessPremiumFeatures();

      if (isPremium) {
        return next();
      }

      // Get today's usage
      const usage = await UsageTracking.getTodayUsage(userId);

      // Check usage against limits
      const fieldMap: Record<string, keyof typeof USAGE_LIMITS.FREE> = {
        aiSearch: 'aiSearch',
        aiDescription: 'aiDescription',
        neighborhoodInsights: 'neighborhoodInsights',
        propertyInsights: 'propertyInsights',
        agentInsights: 'agentInsights',
      };

      const limitKey = fieldMap[featureType];
      const currentUsage = usage[`${featureType}Count` as keyof typeof usage] as number || 0;
      const limit = USAGE_LIMITS.FREE[limitKey];

      // If limit exceeded, return error with upgrade prompt
      if (currentUsage >= limit) {
        return res.status(429).json({
          message: 'Daily usage limit reached',
          error: 'USAGE_LIMIT_EXCEEDED',
          featureType,
          currentUsage,
          limit,
          isPremium: false,
          upgradeMessage: `You've reached your daily limit of ${limit} ${featureType} requests. Upgrade to Premium for unlimited access!`,
          upgradeCta: 'Upgrade to Premium for just €1.50/year',
        });
      }

      // Attach usage info to request for tracking after successful operation
      (req as any).usageTracking = {
        featureType,
        currentUsage,
        limit,
        remaining: limit - currentUsage,
      };

      next();
    } catch (error) {
      console.error('Error checking usage limit:', error);
      // Don't block the request on tracking errors
      next();
    }
  };
};

/**
 * Middleware to increment usage counter after successful feature usage
 * Call this after the main route handler succeeds
 */
export const incrementUsage = async (
  req: UsageLimitRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const usageTracking = (req as any).usageTracking;

    if (!usageTracking || !req.user || !req.user.id) {
      return next();
    }

    // Increment the usage counter
    await UsageTracking.incrementUsage(
      req.user.id,
      usageTracking.featureType
    );

    next();
  } catch (error) {
    console.error('Error incrementing usage:', error);
    // Don't block the response on tracking errors
    next();
  }
};

/**
 * Middleware to attach current usage info to response for client
 */
export const attachUsageInfo = async (
  req: UsageLimitRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return next();
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return next();
    }

    const isPremium = user.canAccessPremiumFeatures();
    const usage = await UsageTracking.getTodayUsage(userId);

    // Attach usage info to response
    (res.locals as any).usageInfo = {
      isPremium,
      limits: isPremium ? USAGE_LIMITS.PREMIUM : USAGE_LIMITS.FREE,
      currentUsage: {
        aiSearch: usage.aiSearchCount,
        aiDescription: usage.aiDescriptionCount,
        neighborhoodInsights: usage.neighborhoodInsightsCount,
        propertyInsights: usage.propertyInsightsViewCount,
        agentInsights: usage.agentInsightsViewCount,
      },
      remaining: isPremium
        ? null // Unlimited
        : {
            aiSearch: Math.max(0, USAGE_LIMITS.FREE.aiSearch - usage.aiSearchCount),
            aiDescription: Math.max(0, USAGE_LIMITS.FREE.aiDescription - usage.aiDescriptionCount),
            neighborhoodInsights: Math.max(0, USAGE_LIMITS.FREE.neighborhoodInsights - usage.neighborhoodInsightsCount),
            propertyInsights: Math.max(0, USAGE_LIMITS.FREE.propertyInsights - usage.propertyInsightsViewCount),
            agentInsights: Math.max(0, USAGE_LIMITS.FREE.agentInsights - usage.agentInsightsViewCount),
          },
    };

    next();
  } catch (error) {
    console.error('Error attaching usage info:', error);
    next();
  }
};
