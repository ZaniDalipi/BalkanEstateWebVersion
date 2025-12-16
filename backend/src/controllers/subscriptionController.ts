import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import SubscriptionEvent from '../models/SubscriptionEvent';
import PaymentRecord from '../models/PaymentRecord';
import Product from '../models/Product';
import User from '../models/User';
import { getGooglePlayService } from '../services/googlePlayService';
import { getAppStoreService } from '../services/appStoreService';

/**
 * @desc    Create a new subscription (web purchases)
 * @route   POST /api/subscriptions
 * @access  Private
 */
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { productId, store, purchaseToken, transactionId } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Find the product
    const product = await Product.findOne({ productId });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Validate purchase based on store
    if (store === 'google' && purchaseToken) {
      const googlePlayService = getGooglePlayService();
      await googlePlayService.validateSubscription(
        product.googlePlayProductId!,
        purchaseToken
      );
    } else if (store === 'apple' && transactionId) {
      const appStoreService = getAppStoreService();
      await appStoreService.validateTransaction(transactionId);
    } else if (store !== 'web' && store !== 'stripe') {
      res.status(400).json({ message: 'Invalid store or missing purchase information' });
      return;
    }

    // Calculate dates
    const startDate = new Date();
    const expirationDate = new Date();

    if (product.billingPeriod === 'monthly') {
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else if (product.billingPeriod === 'yearly') {
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    // Create subscription
    const subscription = await Subscription.create({
      userId,
      store,
      productId: product.productId,
      googlePlayProductId: product.googlePlayProductId,
      appStoreProductId: product.appStoreProductId,
      stripeProductId: product.stripeProductId,
      purchaseToken: store === 'google' ? purchaseToken : undefined,
      transactionId: store === 'apple' ? transactionId : undefined,
      startDate,
      expirationDate,
      renewalDate: expirationDate,
      status: 'active',
      autoRenewing: true,
      price: product.price,
      currency: product.currency,
    });

    // Create subscription event
    await SubscriptionEvent.create({
      subscriptionId: subscription._id,
      userId,
      eventType: 'subscription_purchased',
      store,
      metadata: { productId, price: product.price },
    });

    // Create payment record
    await PaymentRecord.create({
      userId,
      subscriptionId: subscription._id,
      store,
      storeTransactionId: transactionId || purchaseToken || `web_${Date.now()}`,
      transactionType: 'charge',
      transactionDate: startDate,
      amount: product.price,
      currency: product.currency,
      status: 'completed',
      productId: product.productId,
    });

    // Update user subscription status and initialize proSubscription
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isSubscribed = true;
    user.subscriptionPlan = product.productId;
    user.subscriptionExpiresAt = expirationDate;

    // Initialize unified Pro subscription
    const isAgent = user.availableRoles?.includes('agent') || user.role === 'agent';
    user.proSubscription = {
      isActive: true,
      plan: product.billingPeriod === 'monthly' ? 'pro_monthly' : 'pro_yearly',
      expiresAt: expirationDate,
      startedAt: startDate,
      totalListingsLimit: product.listingsLimit || 15,
      activeListingsCount: 0,
      privateSellerCount: 0,
      agentCount: 0,
      promotionCoupons: {
        highlightCoupons: isAgent ? (product.highlightCoupons || 2) : 0,
        usedHighlightCoupons: 0,
      },
    };

    await user.save();

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: {
        id: subscription._id,
        productId: subscription.productId,
        status: subscription.status,
        startDate: subscription.startDate,
        expirationDate: subscription.expirationDate,
      },
      user: {
        id: user._id,
        email: user.email,
        proSubscription: user.proSubscription,
      },
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Error creating subscription', error: error.message });
  }
};

/**
 * @desc    Get user's active subscriptions
 * @route   GET /api/subscriptions
 * @access  Private
 */
export const getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      subscriptions: subscriptions.map((sub) => ({
        id: sub._id,
        productId: sub.productId,
        store: sub.store,
        status: sub.status,
        startDate: sub.startDate,
        expirationDate: sub.expirationDate,
        autoRenewing: sub.autoRenewing,
        price: sub.price,
        currency: sub.currency,
        isActive: sub.isActive(),
        isPremium: sub.isPremium(),
      })),
    });
  } catch (error: any) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({ message: 'Error getting subscriptions', error: error.message });
  }
};

/**
 * @desc    Get user's current active subscription
 * @route   GET /api/subscriptions/current
 * @access  Private
 */
export const getCurrentSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Find the most recent active subscription for this user
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['active', 'trial', 'grace'] },
      expirationDate: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!subscription) {
      // No active subscription found
      res.status(200).json({ subscription: null });
      return;
    }

    res.status(200).json({
      subscription: {
        _id: subscription._id,
        userId: subscription.userId,
        store: subscription.store,
        productId: subscription.productId,
        purchaseToken: subscription.purchaseToken,
        transactionId: subscription.transactionId,
        startDate: subscription.startDate,
        renewalDate: subscription.renewalDate,
        expirationDate: subscription.expirationDate,
        status: subscription.status,
        autoRenewing: subscription.autoRenewing,
        price: subscription.price,
        currency: subscription.currency,
        isAcknowledged: subscription.isAcknowledged,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting current subscription:', error);
    res.status(500).json({ message: 'Error getting current subscription', error: error.message });
  }
};

/**
 * @desc    Get a single subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private
 */
export const getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    res.status(200).json({
      subscription: {
        id: subscription._id,
        productId: subscription.productId,
        store: subscription.store,
        status: subscription.status,
        startDate: subscription.startDate,
        expirationDate: subscription.expirationDate,
        renewalDate: subscription.renewalDate,
        autoRenewing: subscription.autoRenewing,
        price: subscription.price,
        currency: subscription.currency,
        isActive: subscription.isActive(),
        isPremium: subscription.isPremium(),
        isInGracePeriod: subscription.isInGracePeriod(),
        canceledAt: subscription.canceledAt,
        refundedAt: subscription.refundedAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting subscription:', error);
    res.status(500).json({ message: 'Error getting subscription', error: error.message });
  }
};

/**
 * @desc    Cancel a subscription
 * @route   POST /api/subscriptions/:id/cancel
 * @access  Private
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    if (subscription.status === 'canceled' || subscription.status === 'expired') {
      res.status(400).json({ message: 'Subscription is already canceled or expired' });
      return;
    }

    // Cancel with store if applicable
    if (subscription.store === 'google' && subscription.purchaseToken) {
      const googlePlayService = getGooglePlayService();
      await googlePlayService.cancelSubscription(
        subscription.googlePlayProductId!,
        subscription.purchaseToken
      );
    }
    // Note: App Store doesn't support programmatic cancellation

    // Update subscription status
    subscription.status = 'pending_cancellation';
    subscription.autoRenewing = false;
    subscription.willCancelAt = subscription.expirationDate;
    subscription.canceledAt = new Date();
    await subscription.save();

    // Create event
    await SubscriptionEvent.create({
      subscriptionId: subscription._id,
      userId,
      eventType: 'subscription_canceled',
      store: subscription.store,
      metadata: { canceledAt: subscription.canceledAt },
    });

    res.status(200).json({
      message: 'Subscription will be canceled at the end of the billing period',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        willCancelAt: subscription.willCancelAt,
      },
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: 'Error canceling subscription', error: error.message });
  }
};

/**
 * @desc    Restore a canceled subscription
 * @route   POST /api/subscriptions/:id/restore
 * @access  Private
 */
export const restoreSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    if (subscription.status !== 'pending_cancellation') {
      res.status(400).json({ message: 'Subscription is not pending cancellation' });
      return;
    }

    // Restore subscription
    subscription.status = 'active';
    subscription.autoRenewing = true;
    subscription.willCancelAt = undefined;
    subscription.canceledAt = undefined;
    await subscription.save();

    // Create event
    await SubscriptionEvent.create({
      subscriptionId: subscription._id,
      userId,
      eventType: 'subscription_reactivated',
      store: subscription.store,
    });

    res.status(200).json({
      message: 'Subscription restored successfully',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        autoRenewing: subscription.autoRenewing,
      },
    });
  } catch (error: any) {
    console.error('Error restoring subscription:', error);
    res.status(500).json({ message: 'Error restoring subscription', error: error.message });
  }
};

/**
 * @desc    Get subscription events/history
 * @route   GET /api/subscriptions/:id/events
 * @access  Private
 */
export const getSubscriptionEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    const events = await SubscriptionEvent.find({ subscriptionId: id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      events: events.map((event) => ({
        id: event._id,
        eventType: event.eventType,
        store: event.store,
        createdAt: event.createdAt,
        metadata: event.metadata,
      })),
    });
  } catch (error: any) {
    console.error('Error getting subscription events:', error);
    res.status(500).json({ message: 'Error getting subscription events', error: error.message });
  }
};

/**
 * @desc    Get payment records for a subscription
 * @route   GET /api/subscriptions/:id/payments
 * @access  Private
 */
export const getSubscriptionPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    const payments = await PaymentRecord.find({ subscriptionId: id }).sort({
      transactionDate: -1,
    });

    res.status(200).json({
      payments: payments.map((payment) => ({
        id: payment._id,
        transactionType: payment.transactionType,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        transactionDate: payment.transactionDate,
        storeTransactionId: payment.storeTransactionId,
      })),
    });
  } catch (error: any) {
    console.error('Error getting subscription payments:', error);
    res.status(500).json({
      message: 'Error getting subscription payments',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify and sync subscription status with store
 * @route   POST /api/subscriptions/:id/verify
 * @access  Private
 */
export const verifySubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const subscription = await Subscription.findOne({ _id: id, userId });

    if (!subscription) {
      res.status(404).json({ message: 'Subscription not found' });
      return;
    }

    let storeData: any = null;

    // Verify with the appropriate store
    if (subscription.store === 'google' && subscription.purchaseToken) {
      const googlePlayService = getGooglePlayService();
      storeData = await googlePlayService.validateSubscription(
        subscription.googlePlayProductId!,
        subscription.purchaseToken
      );

      // Update subscription based on store data
      const expiryDate = new Date(parseInt(storeData.expiryTimeMillis));
      subscription.expirationDate = expiryDate;
      subscription.autoRenewing = storeData.autoRenewing;

      if (storeData.purchaseState === 0 && expiryDate > new Date()) {
        subscription.status = 'active';
      } else {
        subscription.status = 'expired';
      }
    } else if (subscription.store === 'apple' && subscription.transactionId) {
      const appStoreService = getAppStoreService();
      storeData = await appStoreService.getSubscriptionStatus(subscription.transactionId);

      // Parse and update based on App Store response
      // (Implementation depends on response structure)
    }

    await subscription.save();

    res.status(200).json({
      message: 'Subscription verified and synced',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        expirationDate: subscription.expirationDate,
        autoRenewing: subscription.autoRenewing,
        isActive: subscription.isActive(),
      },
    });
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ message: 'Error verifying subscription', error: error.message });
  }
};
