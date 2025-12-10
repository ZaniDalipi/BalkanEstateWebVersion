import { Request, Response } from 'express';
import AgencyFeaturedSubscription from '../models/AgencyFeaturedSubscription';
import Agency from '../models/Agency';
import PromotionCoupon from '../models/PromotionCoupon';

interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

/**
 * Create or start a featured subscription for an agency
 * POST /api/agencies/:agencyId/featured-subscription
 */
export const createFeaturedSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { agencyId } = req.params;
    const { interval = 'weekly', couponCode, startTrial = false } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if agency exists and user is the owner
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    if (agency.ownerId.toString() !== userId) {
      return res.status(403).json({ error: 'Only agency owner can create subscription' });
    }

    // Check if active subscription already exists
    const existingSubscription = await AgencyFeaturedSubscription.findOne({
      agencyId,
      status: { $in: ['active', 'trial'] },
    });

    if (existingSubscription) {
      return res.status(400).json({
        error: 'Active subscription already exists',
        subscription: existingSubscription,
      });
    }

    // Calculate dates
    const now = new Date();
    let currentPeriodEnd = new Date(now);
    let price = 10; // Default weekly price
    let isTrial = false;
    let trialEndDate: Date | undefined;
    let appliedCouponCode: string | undefined;
    let appliedCouponId: any | undefined;
    let discountApplied = 0;

    // Handle trial
    if (startTrial) {
      isTrial = true;
      trialEndDate = new Date(now);
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days trial
      currentPeriodEnd = new Date(trialEndDate);
      price = 0; // Free during trial
    } else {
      // Calculate period end based on interval
      if (interval === 'weekly') {
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 7);
        price = 10;
      } else if (interval === 'monthly') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        price = 35; // 30% discount for monthly
      } else if (interval === 'yearly') {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        price = 400; // ~23% discount for yearly
      }
    }

    // Apply coupon if provided
    if (couponCode && !isTrial) {
      const coupon = await PromotionCoupon.findOne({
        code: couponCode.toUpperCase(),
        status: 'active',
      });

      if (coupon && coupon.isValid()) {
        const canUse = await coupon.canBeUsedBy(userId as any);
        if (canUse) {
          discountApplied = coupon.calculateDiscount(price);
          price -= discountApplied;
          appliedCouponCode = coupon.code;
          appliedCouponId = coupon._id;
        }
      }
    }

    // Create subscription
    const subscription = new AgencyFeaturedSubscription({
      agencyId,
      userId,
      status: isTrial ? 'trial' : 'pending_payment',
      interval,
      price,
      currency: 'EUR',
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd,
      trialEndDate,
      isTrial,
      trialDays: isTrial ? 7 : undefined,
      appliedCouponCode,
      appliedCouponId,
      discountApplied,
      autoRenewing: true,
      cancelAtPeriodEnd: false,
    });

    await subscription.save();

    // Update agency featured status if trial
    if (isTrial) {
      agency.isFeatured = true;
      agency.featuredStartDate = now;
      agency.featuredEndDate = currentPeriodEnd;
      await agency.save();
    }

    res.status(201).json({
      message: isTrial ? 'Free trial started successfully' : 'Subscription created, pending payment',
      subscription,
      requiresPayment: !isTrial,
    });
  } catch (error) {
    console.error('Error creating featured subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

/**
 * Get agency featured subscription details
 * GET /api/agencies/:agencyId/featured-subscription
 */
export const getFeaturedSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { agencyId } = req.params;

    const subscription = await AgencyFeaturedSubscription.findOne({
      agencyId,
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Error fetching featured subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
};

/**
 * Cancel featured subscription
 * DELETE /api/agencies/:agencyId/featured-subscription
 */
export const cancelFeaturedSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { agencyId } = req.params;
    const { immediately = false } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await AgencyFeaturedSubscription.findOne({
      agencyId,
      status: { $in: ['active', 'trial'] },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Check ownership
    if (subscription.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this subscription' });
    }

    if (immediately) {
      // Cancel immediately
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
      subscription.currentPeriodEnd = new Date();

      // Update agency featured status
      const agency = await Agency.findById(agencyId);
      if (agency) {
        agency.isFeatured = false;
        agency.featuredEndDate = new Date();
        await agency.save();
      }
    } else {
      // Cancel at period end
      subscription.cancelAtPeriodEnd = true;
      subscription.autoRenewing = false;
      subscription.canceledAt = new Date();
    }

    await subscription.save();

    res.json({
      message: immediately
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of current period',
      subscription,
    });
  } catch (error) {
    console.error('Error canceling featured subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

/**
 * Confirm payment and activate subscription (admin or payment webhook)
 * POST /api/agencies/:agencyId/featured-subscription/confirm-payment
 */
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { agencyId } = req.params;
    const { stripeSubscriptionId, stripeCustomerId } = req.body;

    const subscription = await AgencyFeaturedSubscription.findOne({
      agencyId,
      status: 'pending_payment',
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No pending subscription found' });
    }

    // Update subscription
    subscription.status = 'active';
    subscription.stripeSubscriptionId = stripeSubscriptionId;
    subscription.stripeCustomerId = stripeCustomerId;
    subscription.lastPaymentDate = new Date();
    subscription.nextPaymentDate = subscription.currentPeriodEnd;

    await subscription.save();

    // Update agency featured status
    const agency = await Agency.findById(agencyId);
    if (agency) {
      agency.isFeatured = true;
      agency.featuredStartDate = subscription.startDate;
      agency.featuredEndDate = subscription.currentPeriodEnd;
      await agency.save();
    }

    res.json({
      message: 'Payment confirmed, subscription activated',
      subscription,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

/**
 * Apply coupon to subscription
 * POST /api/agencies/:agencyId/featured-subscription/apply-coupon
 */
export const applyCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { agencyId } = req.params;
    const { couponCode } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!couponCode) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const subscription = await AgencyFeaturedSubscription.findOne({
      agencyId,
      status: { $in: ['active', 'trial', 'pending_payment'] },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Find coupon
    const coupon = await PromotionCoupon.findOne({
      code: couponCode.toUpperCase(),
      status: 'active',
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found or expired' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ error: 'Coupon is not valid' });
    }

    const canUse = await coupon.canBeUsedBy(userId as any);
    if (!canUse) {
      return res.status(400).json({ error: 'You cannot use this coupon' });
    }

    // Calculate discount
    const originalPrice = subscription.price + (subscription.discountApplied || 0);
    const discountApplied = coupon.calculateDiscount(originalPrice);
    const newPrice = Math.max(0, originalPrice - discountApplied);

    // Update subscription
    subscription.appliedCouponCode = coupon.code;
    subscription.appliedCouponId = coupon._id as any;
    subscription.discountApplied = discountApplied;
    subscription.price = newPrice;

    await subscription.save();

    res.json({
      message: 'Coupon applied successfully',
      subscription,
      originalPrice,
      discountApplied,
      newPrice,
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
};

/**
 * Check and update expired subscriptions (cron job)
 * GET /api/admin/featured-subscriptions/check-expired
 */
export const checkExpiredSubscriptions = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    // Find all subscriptions that have expired
    const expiredSubscriptions = await AgencyFeaturedSubscription.find({
      status: { $in: ['active', 'trial'] },
      currentPeriodEnd: { $lte: now },
    });

    let updatedCount = 0;
    for (const subscription of expiredSubscriptions) {
      // Check if should auto-renew
      if (subscription.autoRenewing && !subscription.cancelAtPeriodEnd) {
        // In a real implementation, you would charge the payment method here
        // For now, we'll just extend the period
        const newPeriodStart = subscription.currentPeriodEnd;
        const newPeriodEnd = new Date(newPeriodStart);

        if (subscription.interval === 'weekly') {
          newPeriodEnd.setDate(newPeriodEnd.getDate() + 7);
        } else if (subscription.interval === 'monthly') {
          newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
        } else if (subscription.interval === 'yearly') {
          newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
        }

        subscription.currentPeriodStart = newPeriodStart;
        subscription.currentPeriodEnd = newPeriodEnd;
        subscription.nextPaymentDate = newPeriodEnd;
        subscription.isTrial = false; // No longer trial after first renewal

        // Update agency
        const agency = await Agency.findById(subscription.agencyId);
        if (agency) {
          agency.featuredEndDate = newPeriodEnd;
          await agency.save();
        }
      } else {
        // Expire subscription
        subscription.status = 'expired';
        subscription.isTrial = false;

        // Update agency
        const agency = await Agency.findById(subscription.agencyId);
        if (agency) {
          agency.isFeatured = false;
          agency.featuredEndDate = now;
          await agency.save();
        }
      }

      await subscription.save();
      updatedCount++;
    }

    res.json({
      message: `Checked and updated ${updatedCount} expired subscriptions`,
      updatedCount,
    });
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    res.status(500).json({ error: 'Failed to check expired subscriptions' });
  }
};

/**
 * Get all featured subscriptions (admin)
 * GET /api/admin/featured-subscriptions
 */
export const getAllFeaturedSubscriptions = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const subscriptions = await AgencyFeaturedSubscription.find(query)
      .populate('agencyId', 'name slug logo')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AgencyFeaturedSubscription.countDocuments(query);

    res.json({
      subscriptions,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Error fetching featured subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};
