import { Request, Response, NextFunction } from 'express';
import { canStartConversation } from '../services/conversationLimitService';
import Product from '../models/Product';

/**
 * Middleware to check if user can start a new conversation
 * Free users are limited to 10 conversations per day
 */
export const checkConversationLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      res.status(401).json({
        message: 'Authentication required',
        requiresAuth: true,
      });
      return;
    }

    // Check if user can start a conversation
    const result = await canStartConversation(userId);

    if (!result.allowed) {
      // Get user info to determine what plans to recommend
      const user = await require('../models/User').default.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Get recommended products based on user role
      const targetRoles = user.role === 'buyer' ? ['buyer', 'all'] : ['seller', 'all'];

      const recommendedProducts = await Product.find({
        targetRole: { $in: targetRoles },
        isActive: true,
        isVisible: true,
      })
        .sort({ displayOrder: 1, price: 1 })
        .limit(3)
        .lean();

      const formattedProducts = recommendedProducts.map((product) => ({
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

      res.status(403).json({
        message: `You've reached your daily limit of ${result.limit} conversations.`,
        code: 'CONVERSATION_LIMIT_REACHED',
        limit: result.limit,
        current: result.current,
        remaining: 0,
        recommendedProducts: formattedProducts,
        upgradeMessage: user.role === 'buyer' 
          ? 'Upgrade to a premium plan to message unlimited sellers!'
          : 'Upgrade to connect with unlimited buyers and grow your business!',
      });
      return;
    }

    // Attach conversation usage info to request
    (req as any).conversationUsage = result;

    next();
  } catch (error: any) {
    console.error('Conversation limit check error:', error);
    res.status(500).json({ message: 'Error checking conversation limit' });
  }
};
