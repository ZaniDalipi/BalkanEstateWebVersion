import User from '../models/User';

/**
 * Get conversation limits based on subscription plan
 */
export const getConversationLimits = (subscriptionPlan: string | undefined, hasActiveSubscription: boolean) => {
  // Free users (or expired subscriptions) - 10 conversations per day
  if (!hasActiveSubscription || !subscriptionPlan || subscriptionPlan === 'free') {
    return {
      dailyLimit: 10,
    };
  }

  // All paid tiers get unlimited conversations
  return {
    dailyLimit: -1, // Unlimited
  };
};

/**
 * Check if user can start a new conversation
 */
export const canStartConversation = async (userId: string): Promise<{ 
  allowed: boolean; 
  current: number; 
  limit: number; 
  remaining: number;
}> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const hasActiveSubscription = user.hasActiveSubscription();
  const limits = getConversationLimits(user.subscriptionPlan, hasActiveSubscription);
  const limit = limits.dailyLimit;

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1, remaining: -1 };
  }

  // Check if we need to reset daily count
  const now = new Date();
  const lastReset = user.lastConversationReset;
  const shouldReset = !lastReset || !isSameDay(lastReset, now);

  if (shouldReset) {
    // Reset counter for new day
    user.conversationsCount = 0;
    user.lastConversationReset = now;
    await user.save();
  }

  const current = user.conversationsCount || 0;
  const remaining = Math.max(0, limit - current);

  return {
    allowed: current < limit,
    current,
    limit,
    remaining,
  };
};

/**
 * Increment conversation count for a user
 */
export const incrementConversationCount = async (userId: string): Promise<{ 
  current: number; 
  limit: number; 
  remaining: number;
}> => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if we need to reset for new day
  const now = new Date();
  const lastReset = user.lastConversationReset;
  const shouldReset = !lastReset || !isSameDay(lastReset, now);

  if (shouldReset) {
    user.conversationsCount = 1;
    user.lastConversationReset = now;
  } else {
    user.conversationsCount = (user.conversationsCount || 0) + 1;
  }

  user.totalConversationsCreated = (user.totalConversationsCreated || 0) + 1;
  await user.save();

  const hasActiveSubscription = user.hasActiveSubscription();
  const limits = getConversationLimits(user.subscriptionPlan, hasActiveSubscription);
  const limit = limits.dailyLimit;

  const remaining = limit === -1 ? -1 : Math.max(0, limit - user.conversationsCount);

  return {
    current: user.conversationsCount,
    limit,
    remaining,
  };
};

/**
 * Helper to check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

/**
 * Get conversation stats for a user
 */
export const getConversationStats = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const hasActiveSubscription = user.hasActiveSubscription();
  const limits = getConversationLimits(user.subscriptionPlan, hasActiveSubscription);
  const limit = limits.dailyLimit;

  // Check if count should be reset
  const now = new Date();
  const lastReset = user.lastConversationReset;
  const shouldReset = !lastReset || !isSameDay(lastReset, now);

  const current = shouldReset ? 0 : (user.conversationsCount || 0);
  const remaining = limit === -1 ? -1 : Math.max(0, limit - current);

  return {
    current,
    limit,
    remaining,
    totalConversations: user.totalConversationsCreated || 0,
  };
};
