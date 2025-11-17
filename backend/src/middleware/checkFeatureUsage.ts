import { Request, Response, NextFunction } from 'express';
import { canUseFeature } from '../services/featureUsageService';
import { FeatureType } from '../models/FeatureUsage';
import User from '../models/User';
import Product from '../models/Product';

/**
 * Middleware factory to check if user can use a specific feature
 * Responds with 403 and upgrade prompt if limit is exceeded
 */
export const checkFeatureLimit = (featureType: FeatureType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?._id;

      if (!userId) {
        res.status(401).json({
          message: 'Authentication required',
          requiresAuth: true,
        });
        return;
      }

      // Check if user can use this feature
      const result = await canUseFeature(userId, featureType);

      if (!result.allowed) {
        // Get user info to determine what plans to recommend
        const user = await User.findById(userId);
        if (!user) {
          res.status(404).json({ message: 'User not found' });
          return;
        }

        // Get recommended products based on user role
        const recommendedProducts = await getRecommendedProducts(user.role);

        res.status(403).json({
          message: `You've reached your daily limit of ${result.limit} ${getFeatureName(featureType)}.`,
          code: 'FEATURE_LIMIT_REACHED',
          featureType,
          limit: result.limit,
          current: result.current,
          remaining: 0,
          recommendedProducts,
          upgradeMessage: getUpgradeMessage(user.role, featureType),
        });
        return;
      }

      // Attach usage info to request for controller to use
      (req as any).featureUsage = result;

      next();
    } catch (error: any) {
      console.error('Feature usage check error:', error);
      res.status(500).json({ message: 'Error checking feature usage' });
    }
  };
};

/**
 * Get human-readable feature name
 */
const getFeatureName = (featureType: FeatureType): string => {
  switch (featureType) {
    case 'ai_search':
      return 'AI searches';
    case 'ai_property_insights':
      return 'AI property insights';
    case 'neighborhood_insights':
      return 'neighborhood insights';
    default:
      return 'uses';
  }
};

/**
 * Get recommended products based on user role
 */
const getRecommendedProducts = async (role: string) => {
  let targetRoles: string[] = [];

  if (role === 'private_seller' || role === 'agent') {
    // For sellers, recommend seller plans
    targetRoles = ['seller', 'all'];
  } else {
    // For buyers, recommend buyer/general plans
    targetRoles = ['buyer', 'all'];
  }

  const products = await Product.find({
    targetRole: { $in: targetRoles },
    isActive: true,
    isVisible: true,
  })
    .sort({ displayOrder: 1, price: 1 })
    .limit(3)
    .lean();

  return products.map((product) => ({
    id: product._id,
    productId: product.productId,
    name: product.name,
    description: product.description,
    price: product.price,
    currency: product.currency,
    billingPeriod: product.billingPeriod,
    features: product.features,
    badge: product.badge,
    badgeColor: product.badgeColor,
    highlighted: product.highlighted,
  }));
};

/**
 * Get upgrade message based on user role and feature
 */
const getUpgradeMessage = (role: string, featureType: FeatureType): string => {
  const featureName = getFeatureName(featureType);

  if (role === 'private_seller' || role === 'agent') {
    return `Upgrade to one of our seller plans to get unlimited ${featureName} and grow your business!`;
  }

  return `Upgrade to a premium plan to get unlimited ${featureName} and discover your perfect property!`;
};

/**
 * Middleware to add feature usage statistics to response
 * Use this for endpoints that need to show usage info without enforcing limits
 */
export const addFeatureUsageStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?._id;

    if (userId) {
      const { getUsageStats } = require('../services/featureUsageService');
      const stats = await getUsageStats(userId);
      (req as any).featureUsageStats = stats;
    }

    next();
  } catch (error: any) {
    // Don't fail the request, just log the error
    console.error('Error adding feature usage stats:', error);
    next();
  }
};
