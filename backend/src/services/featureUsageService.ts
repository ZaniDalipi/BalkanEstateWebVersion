import FeatureUsage, { FeatureType } from '../models/FeatureUsage';
import User from '../models/User';
import mongoose from 'mongoose';

/**
 * Get the start of today (midnight UTC) for consistent daily tracking
 */
const getStartOfDay = (date: Date = new Date()): Date => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get feature limits based on subscription plan
 */
export const getFeatureLimits = (subscriptionPlan: string | undefined, hasActiveSubscription: boolean) => {
  // Free users (or expired subscriptions)
  if (!hasActiveSubscription || !subscriptionPlan || subscriptionPlan === 'free') {
    return {
      ai_search: 3,
      ai_property_insights: 3,
      neighborhood_insights: 3,
    };
  }

  // Pro tier (monthly or yearly)
  if (subscriptionPlan.includes('pro_monthly') || subscriptionPlan.includes('pro_yearly')) {
    return {
      ai_search: -1, // Unlimited
      ai_property_insights: -1, // Unlimited
      neighborhood_insights: -1, // Unlimited
    };
  }

  // Enterprise tier
  if (subscriptionPlan === 'enterprise') {
    return {
      ai_search: -1, // Unlimited
      ai_property_insights: -1, // Unlimited
      neighborhood_insights: -1, // Unlimited
    };
  }

  // Default to free tier limits
  return {
    ai_search: 3,
    ai_property_insights: 3,
    neighborhood_insights: 3,
  };
};

/**
 * Check if user can use a feature (has not exceeded daily limit)
 */
export const canUseFeature = async (
  userId: string | mongoose.Types.ObjectId,
  featureType: FeatureType
): Promise<{ allowed: boolean; current: number; limit: number; remaining: number }> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const hasActiveSubscription = user.hasActiveSubscription();
  const limits = getFeatureLimits(user.subscriptionPlan, hasActiveSubscription);
  const limit = limits[featureType];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1, remaining: -1 };
  }

  // Get usage for today
  const today = getStartOfDay();
  const usage = await FeatureUsage.findOne({
    userId,
    featureType,
    date: today,
  });

  const current = usage?.count || 0;
  const remaining = Math.max(0, limit - current);

  return {
    allowed: current < limit,
    current,
    limit,
    remaining,
  };
};

/**
 * Increment feature usage for a user
 */
export const incrementFeatureUsage = async (
  userId: string | mongoose.Types.ObjectId,
  featureType: FeatureType
): Promise<{ current: number; limit: number; remaining: number }> => {
  const today = getStartOfDay();

  // Use findOneAndUpdate with upsert to atomically increment or create
  const usage = await FeatureUsage.findOneAndUpdate(
    {
      userId,
      featureType,
      date: today,
    },
    {
      $inc: { count: 1 },
      $setOnInsert: { userId, featureType, date: today },
    },
    {
      upsert: true,
      new: true,
    }
  );

  // Get user's limit
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const hasActiveSubscription = user.hasActiveSubscription();
  const limits = getFeatureLimits(user.subscriptionPlan, hasActiveSubscription);
  const limit = limits[featureType];

  const remaining = limit === -1 ? -1 : Math.max(0, limit - usage.count);

  return {
    current: usage.count,
    limit,
    remaining,
  };
};

/**
 * Get current usage statistics for a user
 */
export const getUsageStats = async (userId: string | mongoose.Types.ObjectId) => {
  const today = getStartOfDay();
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const hasActiveSubscription = user.hasActiveSubscription();
  const limits = getFeatureLimits(user.subscriptionPlan, hasActiveSubscription);

  const usageRecords = await FeatureUsage.find({
    userId,
    date: today,
  });

  const stats = {
    ai_search: { current: 0, limit: limits.ai_search, remaining: limits.ai_search },
    ai_property_insights: { current: 0, limit: limits.ai_property_insights, remaining: limits.ai_property_insights },
    neighborhood_insights: { current: 0, limit: limits.neighborhood_insights, remaining: limits.neighborhood_insights },
  };

  usageRecords.forEach((record) => {
    const featureType = record.featureType as FeatureType;
    const limit = stats[featureType].limit;
    stats[featureType].current = record.count;
    stats[featureType].remaining = limit === -1 ? -1 : Math.max(0, limit - record.count);
  });

  return stats;
};

/**
 * Clean up old feature usage records (older than 30 days)
 * This should be called periodically by a background job
 */
export const cleanupOldUsageRecords = async (): Promise<number> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await FeatureUsage.deleteMany({
    date: { $lt: getStartOfDay(thirtyDaysAgo) },
  });

  return result.deletedCount || 0;
};
