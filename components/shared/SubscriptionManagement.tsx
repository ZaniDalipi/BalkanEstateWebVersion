import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, HomeIcon, ChartBarIcon, CheckIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';

interface SubscriptionManagementProps {
  userId: string;
}

// Plan definitions with pricing
const PLANS: Record<string, {
  id: string;
  name: string;
  price: number;
  period: string;
  periodDays: number;
  features: string[];
  listingLimit: number;
  color: string;
  tier: number;
}> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    periodDays: 0,
    features: ['3 active listings', 'Basic analytics', 'Email support'],
    listingLimit: 3,
    color: 'from-gray-400 to-gray-500',
    tier: 0,
  },
  seller_pro_monthly: {
    id: 'seller_pro_monthly',
    name: 'Pro Monthly',
    price: 25,
    period: 'month',
    periodDays: 30,
    features: ['15 active listings', 'Advanced analytics', 'Priority support', 'Featured listings', 'Export data'],
    listingLimit: 15,
    color: 'from-blue-500 to-blue-600',
    tier: 1,
  },
  seller_pro_yearly: {
    id: 'seller_pro_yearly',
    name: 'Pro Yearly',
    price: 200,
    period: 'year',
    periodDays: 365,
    features: ['15 active listings', 'Advanced analytics', 'Priority support', 'Featured listings', 'Export data', '33% savings'],
    listingLimit: 15,
    color: 'from-purple-500 to-purple-600',
    tier: 2,
  },
  seller_enterprise_yearly: {
    id: 'seller_enterprise_yearly',
    name: 'Enterprise',
    price: 500,
    period: 'year',
    periodDays: 365,
    features: ['100 active listings', 'Full analytics suite', 'Dedicated support', 'Custom branding', 'API access', 'Team management', 'Agency creation'],
    listingLimit: 100,
    color: 'from-amber-500 to-orange-600',
    tier: 3,
  },
};

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ userId }) => {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const user = state.currentUser as User & {
    subscriptionPlan?: string;
    subscriptionProductName?: string;
    subscriptionSource?: string;
    subscriptionExpiresAt?: string;
    subscriptionStartedAt?: string;
    subscriptionStatus?: string;
  };

  useEffect(() => {
    setLoading(false);
  }, [userId, state.currentUser]);

  // Calculate subscription details
  const subscriptionDetails = useMemo(() => {
    if (!user) return null;

    const now = new Date();
    const expiresAt = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
    const startedAt = user.subscriptionStartedAt ? new Date(user.subscriptionStartedAt) : null;

    const daysRemaining = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const daysUsed = startedAt ? Math.max(0, Math.ceil((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24))) : 0;

    const currentPlanKey = user.subscriptionPlan || 'free';
    const currentPlan = PLANS[currentPlanKey] || PLANS.free;
    const totalDays = currentPlan.periodDays || 30;

    const dailyRate = totalDays > 0 ? currentPlan.price / totalDays : 0;
    const usedValue = dailyRate * Math.min(daysUsed, totalDays);
    const remainingValue = Math.max(0, currentPlan.price - usedValue);
    const progressPercent = totalDays > 0 ? Math.min(100, (daysUsed / totalDays) * 100) : 0;

    return {
      daysRemaining,
      daysUsed,
      totalDays,
      usedValue,
      remainingValue,
      dailyRate,
      progressPercent,
      currentPlan,
      currentPlanKey,
      isActive: user.subscriptionStatus === 'active' && daysRemaining > 0,
      isExpired: user.subscriptionStatus === 'expired' || (expiresAt && expiresAt < now),
      expiresAt,
      startedAt,
    };
  }, [user]);

  // Calculate upgrade price with pro-rated discount
  const calculateUpgradePrice = (targetPlanKey: string) => {
    if (!subscriptionDetails) return { originalPrice: 0, discount: 0, finalPrice: 0, savings: '' };

    const targetPlan = PLANS[targetPlanKey];
    if (!targetPlan) return { originalPrice: 0, discount: 0, finalPrice: 0, savings: '' };

    const originalPrice = targetPlan.price;

    if (subscriptionDetails.currentPlanKey === 'free' || subscriptionDetails.isExpired) {
      return { originalPrice, discount: 0, finalPrice: originalPrice, savings: '' };
    }

    const credit = subscriptionDetails.remainingValue;
    const discount = Math.min(credit, originalPrice * 0.5);
    const finalPrice = Math.max(0, originalPrice - discount);
    const savings = discount > 0 ? `You save €${discount.toFixed(2)} from your current plan!` : '';

    return { originalPrice, discount, finalPrice, savings };
  };

  // Get available upgrade options
  const upgradeOptions = useMemo(() => {
    if (!subscriptionDetails) return [];

    return Object.entries(PLANS)
      .filter(([key, plan]) => {
        if (key === 'free') return false;
        if (key === subscriptionDetails.currentPlanKey) return false;
        if (subscriptionDetails.currentPlanKey === 'seller_pro_monthly' && key === 'seller_pro_yearly') return true;
        return plan.tier > subscriptionDetails.currentPlan.tier;
      })
      .map(([key, plan]) => ({
        key,
        plan,
        pricing: calculateUpgradePrice(key),
      }));
  }, [subscriptionDetails]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'grace': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpgradeClick = (planKey: string) => {
    setSelectedUpgrade(planKey);
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = () => {
    if (selectedUpgrade) {
      const pricing = calculateUpgradePrice(selectedUpgrade);
      // Dispatch to open payment flow
      dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: false } });
    }
    setShowUpgradeModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-neutral-600 font-medium">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  if (!user?.isSubscribed || !subscriptionDetails) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary-light/5 to-white rounded-2xl shadow-lg border border-neutral-200/50 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -z-10"></div>

          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 mb-2">
              <XCircleIcon className="w-10 h-10 text-neutral-400" />
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">No Active Subscription</h3>
              <p className="text-neutral-600 text-lg max-w-md mx-auto">
                Unlock premium features and take your experience to the next level
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-4">
              {['Priority Support', 'Advanced Analytics', '15+ Listings', 'Premium Placement'].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                  <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{benefit}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: false } })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 mt-4"
            >
              <SparklesIcon className="w-5 h-5" />
              View Plans & Pricing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <div className={`bg-gradient-to-br ${subscriptionDetails.currentPlan.color} rounded-2xl p-6 text-white shadow-xl`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{subscriptionDetails.currentPlan.name}</h2>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(user.subscriptionStatus)}`}>
                  {user.subscriptionStatus?.toUpperCase() || 'FREE'}
                </span>
              </div>
            </div>
            <p className="text-white/80 text-sm">
              {subscriptionDetails.currentPlan.price > 0
                ? `€${subscriptionDetails.currentPlan.price}/${subscriptionDetails.currentPlan.period}`
                : 'Free forever'}
            </p>
          </div>

          {subscriptionDetails.currentPlan.price > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/80">Time Remaining</span>
                <span className="text-xl font-bold">{subscriptionDetails.daysRemaining} days</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${100 - subscriptionDetails.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/70 mt-1">
                <span>{subscriptionDetails.daysUsed} days used</span>
                <span>{subscriptionDetails.totalDays} days total</span>
              </div>
            </div>
          )}
        </div>

        {subscriptionDetails.currentPlan.price > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/70">Started</span>
              <p className="font-semibold">{formatDate(subscriptionDetails.startedAt)}</p>
            </div>
            <div>
              <span className="text-white/70">Expires</span>
              <p className="font-semibold">{formatDate(subscriptionDetails.expiresAt)}</p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-sm text-white/70 mb-2">Your plan includes:</p>
          <div className="flex flex-wrap gap-2">
            {subscriptionDetails.currentPlan.features.map((feature, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-xs">
                <CheckIcon className="w-3 h-3" />
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Limit Info */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HomeIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-neutral-800">Listing Limit</p>
              <p className="text-sm text-neutral-500">
                {user.listingsCount || 0} of {subscriptionDetails.currentPlan.listingLimit} listings used
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-neutral-800">
              {subscriptionDetails.currentPlan.listingLimit - (user.listingsCount || 0)}
            </p>
            <p className="text-xs text-neutral-500">remaining</p>
          </div>
        </div>
        <div className="mt-3 w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, ((user.listingsCount || 0) / subscriptionDetails.currentPlan.listingLimit) * 100)}%` }}
          />
        </div>
      </div>

      {/* Upgrade Options */}
      {upgradeOptions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Upgrade Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upgradeOptions.map(({ key, plan, pricing }) => (
              <div
                key={key}
                className="bg-white rounded-xl border-2 border-neutral-200 hover:border-primary transition-colors overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className={`bg-gradient-to-r ${plan.color} p-4 text-white`}>
                  <h4 className="font-bold text-lg">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    {pricing.discount > 0 && (
                      <span className="text-sm line-through text-white/60">€{pricing.originalPrice}</span>
                    )}
                    <span className="text-2xl font-bold">€{pricing.finalPrice.toFixed(2)}</span>
                    <span className="text-sm text-white/80">/{plan.period}</span>
                  </div>
                  {pricing.savings && (
                    <p className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full inline-block">
                      {pricing.savings}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                        <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgradeClick(key)}
                    className={`w-full py-2.5 rounded-lg font-bold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro-rated Calculator Info */}
      {subscriptionDetails.currentPlan.price > 0 && subscriptionDetails.isActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Pro-rated Upgrade Pricing</h4>
              <p className="text-sm text-blue-700 mt-1">
                When you upgrade, we calculate the unused value from your current plan (€{subscriptionDetails.remainingValue.toFixed(2)} remaining)
                and apply it as a discount to your new plan.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Daily rate: €{subscriptionDetails.dailyRate.toFixed(2)}/day •
                Days used: {subscriptionDetails.daysUsed} •
                Credit available: €{subscriptionDetails.remainingValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && selectedUpgrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Confirm Upgrade</h3>
            {(() => {
              const plan = PLANS[selectedUpgrade];
              const pricing = calculateUpgradePrice(selectedUpgrade);
              return (
                <>
                  <div className="bg-neutral-50 rounded-xl p-4 mb-4">
                    <p className="text-sm text-neutral-600 mb-2">Upgrading to:</p>
                    <p className="text-lg font-bold text-neutral-800">{plan.name}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">Original Price</span>
                        <span className="font-medium">€{pricing.originalPrice}</span>
                      </div>
                      {pricing.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Pro-rated Credit</span>
                          <span className="font-medium">-€{pricing.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200">
                        <span>Total Due</span>
                        <span className="text-primary">€{pricing.finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {pricing.discount > 0 && (
                    <p className="text-sm text-green-600 mb-4">🎉 {pricing.savings}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowUpgradeModal(false)}
                      className="flex-1 py-2.5 rounded-lg font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmUpgrade}
                      className="flex-1 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary-dark transition-colors"
                    >
                      Pay €{pricing.finalPrice.toFixed(2)}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
