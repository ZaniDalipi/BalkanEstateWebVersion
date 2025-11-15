import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import { processSubscriptionPayment } from '../services/subscriptionPaymentService';

/**
 * @desc    Create a mock payment intent for a subscription
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const userId = (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Create a mock payment intent (no real payment processing)
    const mockPaymentIntentId = 'mock_pi_' + Math.random().toString(36).substring(2, 15);

    console.log(`Mock payment intent created for user ${user.email}: ${mockPaymentIntentId}`);

    res.status(200).json({
      clientSecret: 'mock_secret_' + Math.random().toString(36).substring(2, 15),
      paymentIntentId: mockPaymentIntentId,
      success: true,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

/**
 * @desc    Process a mock payment (simulate payment success)
 * @route   POST /api/payments/process
 * @access  Private
 */
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planName, planInterval, amount = 1.50 } = req.body;
    const userId = (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Determine product ID based on plan name and interval
    let productId = 'buyer_pro_monthly';
    if (planName.toLowerCase().includes('buyer') && planInterval === 'month') {
      productId = 'buyer_pro_monthly';
    } else if (planName.toLowerCase().includes('buyer') && planInterval === 'year') {
      productId = 'buyer_pro_yearly';
    } else if (planName.toLowerCase().includes('seller') && planInterval === 'month') {
      productId = 'seller_premium_monthly';
    } else if (planName.toLowerCase().includes('seller') && planInterval === 'year') {
      productId = 'seller_premium_yearly';
    }

    // Try to find the product, or create a default one
    let product = await Product.findOne({ productId });

    if (!product) {
      // Create a default product for testing
      product = await Product.create({
        productId,
        name: planName,
        description: `${planName} subscription`,
        price: amount,
        currency: 'EUR',
        billingPeriod: planInterval === 'year' ? 'yearly' : 'monthly',
        isActive: true,
      });
    }

    // Use the secure payment processing service (ATOMIC TRANSACTION)
    const result = await processSubscriptionPayment({
      userId,
      productId,
      store: 'web',
      amount: product.price,
      currency: product.currency,
    });

    console.log(`✅ Payment processed for user ${user.email}: ${productId}`);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      subscription: {
        id: result.subscription._id,
        plan: productId,
        productName: product.name,
        source: 'web',
        expiresAt: result.subscription.expirationDate,
        status: result.subscription.status,
      },
      payment: {
        id: result.paymentRecord._id,
        amount: result.paymentRecord.amount,
        currency: result.paymentRecord.currency,
      },
    });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

/**
 * @desc    Get subscription status for current user
 * @route   GET /api/payments/subscription-status
 * @access  Private
 */
export const getSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      isSubscribed: user.isSubscribed,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionProductName: user.subscriptionProductName,
      subscriptionSource: user.subscriptionSource,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      subscriptionStatus: user.subscriptionStatus,
      hasActiveSubscription: user.hasActiveSubscription(),
      canAccessPremium: user.canAccessPremiumFeatures(),
    });
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ message: 'Error getting subscription status', error: error.message });
  }
};

/**
 * @desc    Cancel subscription
 * @route   POST /api/payments/cancel-subscription
 * @access  Private
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update user subscription status
    user.isSubscribed = false;
    user.subscriptionPlan = 'free';
    // Keep expiration date for reference
    await user.save();

    console.log(`Subscription cancelled for user ${user.email}`);

    res.status(200).json({
      message: 'Subscription cancelled successfully',
      user: {
        isSubscribed: user.isSubscribed,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Error cancelling subscription', error: error.message });
  }
};
