import { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Price mapping for subscription plans
const PLAN_PRICES: Record<string, number> = {
  buyer_pro_monthly: 150, // €1.50 in cents
  pro_monthly: 2500, // €25 in cents
  pro_yearly: 20000, // €200 in cents
  enterprise: 100000, // €1000 in cents
};

/**
 * @desc    Create a payment intent for a subscription
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

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: currency || 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: String(userId),
        planName: planName || 'subscription',
        planInterval: planInterval || 'month',
        userEmail: userEmail || user.email,
      },
      description: `${planName} subscription for ${user.email}`,
      receipt_email: userEmail || user.email,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

/**
 * @desc    Handle Stripe webhook events
 * @route   POST /api/payments/webhook
 * @access  Public (but verified by Stripe signature)
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    res.status(500).json({ message: 'Webhook secret not configured' });
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ message: `Webhook Error: ${err.message}` });
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(failedPayment);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(deletedSubscription);
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(updatedSubscription);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  try {
    const userId = paymentIntent.metadata.userId;
    const planName = paymentIntent.metadata.planName;
    const planInterval = paymentIntent.metadata.planInterval;

    if (!userId) {
      console.error('No userId in payment intent metadata');
      return;
    }

    // Update user subscription status
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    // Determine subscription plan
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

    user.isSubscribed = true;
    user.subscriptionPlan = subscriptionPlan;
    user.subscriptionExpiresAt = expirationDate;
    await user.save();

    console.log(`Subscription activated for user ${user.email}: ${subscriptionPlan}`);

    // TODO: Send confirmation email to user
    // await sendSubscriptionConfirmationEmail(user, subscriptionPlan);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  try {
    const userId = paymentIntent.metadata.userId;

    if (!userId) {
      console.error('No userId in payment intent metadata');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    console.log(`Payment failed for user ${user.email}`);

    // TODO: Send payment failed notification email
    // await sendPaymentFailedEmail(user);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
  try {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    user.isSubscribed = false;
    user.subscriptionPlan = 'free';
    user.subscriptionExpiresAt = undefined;
    await user.save();

    console.log(`Subscription cancelled for user ${user.email}`);

    // TODO: Send cancellation confirmation email
    // await sendSubscriptionCancelledEmail(user);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  try {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return;
    }

    console.log(`Subscription updated for user ${user.email}`);

    // TODO: Handle subscription updates (plan changes, etc.)
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

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
    // Keep expiration date for grace period
    await user.save();

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
