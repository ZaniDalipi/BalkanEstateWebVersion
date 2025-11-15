import { Request, Response } from 'express';
import User from '../models/User';

/**
 * @desc    Create a mock payment intent for a subscription
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency, planName, planInterval, userEmail } = req.body;
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
    const { paymentIntentId, planName, planInterval } = req.body;
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

    // Determine subscription plan and expiration
    let subscriptionPlan: 'free' | 'pro_monthly' | 'pro_yearly' | 'enterprise' = 'free';
    let expirationDate = new Date();

    if (planName.toLowerCase().includes('buyer')) {
      subscriptionPlan = 'pro_monthly';
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else if (planName.toLowerCase().includes('pro') && planInterval === 'month') {
      subscriptionPlan = 'pro_monthly';
      expirationDate.setMonth(expirationDate.getMonth() + 1);
    } else if (planName.toLowerCase().includes('pro') && planInterval === 'year') {
      subscriptionPlan = 'pro_yearly';
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    } else if (planName.toLowerCase().includes('enterprise')) {
      subscriptionPlan = 'enterprise';
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    }

    // Update user subscription
    user.isSubscribed = true;
    user.subscriptionPlan = subscriptionPlan;
    user.subscriptionExpiresAt = expirationDate;
    await user.save();

    console.log(`Mock payment processed for user ${user.email}: ${subscriptionPlan}`);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      subscription: {
        plan: subscriptionPlan,
        expiresAt: expirationDate,
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
      subscriptionExpiresAt: user.subscriptionExpiresAt,
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
