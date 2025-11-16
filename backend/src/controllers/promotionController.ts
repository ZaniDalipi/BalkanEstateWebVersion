import { Request, Response } from 'express';
import Promotion from '../models/Promotion';
import Property from '../models/Property';
import User, { IUser } from '../models/User';

// @desc    Promote a property
// @route   POST /api/promotions
// @access  Private (Pro/Enterprise tiers only)
export const promoteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { propertyId } = req.body;
    const currentUser = req.user as IUser;
    const user = await User.findById(String(currentUser._id));

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user has a paid tier
    const paidTiers = ['pro_monthly', 'pro_yearly', 'enterprise'];
    if (!paidTiers.includes(user.subscriptionPlan || '')) {
      res.status(403).json({
        message: 'Property promotion is only available for Pro and Enterprise tiers.',
        code: 'TIER_UPGRADE_REQUIRED',
      });
      return;
    }

    // Check if subscription is expired
    if (user.subscriptionExpiresAt && user.subscriptionExpiresAt < new Date()) {
      res.status(403).json({
        message: 'Your subscription has expired. Please renew to promote properties.',
        code: 'SUBSCRIPTION_EXPIRED',
      });
      return;
    }

    // Get active promotions count
    const activePromotionsCount = await Promotion.countDocuments({
      userId: user._id,
      isActive: true,
      endDate: { $gt: new Date() },
    });

    // Pro tier allows 2 promoted ads
    const PROMOTION_LIMIT = 2;
    if (activePromotionsCount >= PROMOTION_LIMIT) {
      res.status(403).json({
        message: `You have reached the limit of ${PROMOTION_LIMIT} promoted properties. Please wait for existing promotions to expire.`,
        code: 'PROMOTION_LIMIT_REACHED',
        limit: PROMOTION_LIMIT,
        current: activePromotionsCount,
      });
      return;
    }

    // Check if property exists and belongs to user
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (property.sellerId.toString() !== String(currentUser._id)) {
      res.status(403).json({ message: 'You can only promote your own properties' });
      return;
    }

    // Check if property is already promoted
    const existingPromotion = await Promotion.findOne({
      propertyId,
      isActive: true,
      endDate: { $gt: new Date() },
    });

    if (existingPromotion) {
      res.status(400).json({
        message: 'This property is already promoted',
        promotion: existingPromotion,
      });
      return;
    }

    // Create promotion (15 days)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 15); // 15 days promotion

    const promotion = await Promotion.create({
      userId: user._id,
      propertyId,
      startDate,
      endDate,
      isActive: true,
      promotionType: 'featured',
    });

    // Update property
    property.isPromoted = true;
    property.promotionStartDate = startDate;
    property.promotionEndDate = endDate;
    await property.save();

    // Update user's promoted ads count
    user.promotedAdsCount = (user.promotedAdsCount || 0) + 1;
    await user.save();

    res.status(201).json({
      message: 'Property promoted successfully',
      promotion,
      property,
    });
  } catch (error: any) {
    console.error('Promote property error:', error);
    res.status(500).json({ message: 'Error promoting property', error: error.message });
  }
};

// @desc    Get user's active promotions
// @route   GET /api/promotions
// @access  Private
export const getMyPromotions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const promotions = await Promotion.find({
      userId: String((req.user as IUser)._id),
    })
      .populate('propertyId')
      .sort({ createdAt: -1 });

    res.json({ promotions });
  } catch (error: any) {
    console.error('Get promotions error:', error);
    res.status(500).json({ message: 'Error fetching promotions', error: error.message });
  }
};

// @desc    Cancel/deactivate a promotion
// @route   DELETE /api/promotions/:id
// @access  Private
export const cancelPromotion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      res.status(404).json({ message: 'Promotion not found' });
      return;
    }

    // Check ownership
    if (promotion.userId.toString() !== String((req.user as IUser)._id)) {
      res.status(403).json({ message: 'Not authorized to cancel this promotion' });
      return;
    }

    // Deactivate promotion
    promotion.isActive = false;
    await promotion.save();

    // Update property
    const property = await Property.findById(promotion.propertyId);
    if (property) {
      property.isPromoted = false;
      await property.save();
    }

    // Update user's promoted ads count
    const user = await User.findById(String((req.user as IUser)._id));
    if (user && user.promotedAdsCount && user.promotedAdsCount > 0) {
      user.promotedAdsCount -= 1;
      await user.save();
    }

    res.json({ message: 'Promotion cancelled successfully' });
  } catch (error: any) {
    console.error('Cancel promotion error:', error);
    res.status(500).json({ message: 'Error cancelling promotion', error: error.message });
  }
};

// @desc    Get all promoted properties (public)
// @route   GET /api/promotions/featured
// @access  Public
export const getFeaturedProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { city, limit = 10 } = req.query;

    // Find active promotions
    const filter: any = {
      isActive: true,
      endDate: { $gt: new Date() },
    };

    const promotions = await Promotion.find(filter)
      .populate({
        path: 'propertyId',
        match: city ? { city: new RegExp(city as string, 'i'), status: 'active' } : { status: 'active' },
        populate: {
          path: 'sellerId',
          select: 'name email phone avatarUrl role agencyName',
        },
      })
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Filter out promotions where property was not found or doesn't match filters
    const validPromotions = promotions.filter(p => p.propertyId !== null);

    res.json({ promotions: validPromotions });
  } catch (error: any) {
    console.error('Get featured properties error:', error);
    res.status(500).json({ message: 'Error fetching featured properties', error: error.message });
  }
};
