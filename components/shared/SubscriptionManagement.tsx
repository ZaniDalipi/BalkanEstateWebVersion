import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';

interface SubscriptionManagementProps {
  userId: string;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ userId }) => {
  const { state, dispatch } = useAppContext();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      // For now, use the user data from state
      // In the future, this could fetch from the backend API
      setLoading(false);
      if (state.currentUser) {
        setSubscription({
          isSubscribed: state.currentUser.isSubscribed || false,
          subscriptionPlan: state.currentUser.subscriptionPlan,
          subscriptionProductName: state.currentUser.subscriptionProductName,
          subscriptionSource: state.currentUser.subscriptionSource,
          subscriptionExpiresAt: state.currentUser.subscriptionExpiresAt,
          subscriptionStatus: state.currentUser.subscriptionStatus,
        });
      }
    };

    fetchSubscription();
  }, [userId, state.currentUser]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          text: 'text-white',
          label: 'Active',
          icon: '✓'
        };
      case 'expired':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-500',
          text: 'text-white',
          label: 'Expired',
          icon: '✕'
        };
      case 'trial':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          text: 'text-white',
          label: 'Trial',
          icon: '⚡'
        };
      case 'grace':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
          text: 'text-white',
          label: 'Grace Period',
          icon: '⏰'
        };
      case 'canceled':
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
          text: 'text-white',
          label: 'Canceled',
          icon: '○'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-neutral-500 to-gray-500',
          text: 'text-white',
          label: 'Unknown',
          icon: '?'
        };
    }
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'google':
        return { text: 'Google Play', color: 'from-green-600 to-green-700', icon: '▶' };
      case 'apple':
        return { text: 'App Store', color: 'from-blue-600 to-blue-700', icon: '' };
      case 'stripe':
        return { text: 'Stripe', color: 'from-purple-600 to-purple-700', icon: '💳' };
      case 'web':
        return { text: 'Web Payment', color: 'from-indigo-600 to-indigo-700', icon: '🌐' };
      default:
        return { text: 'Unknown', color: 'from-neutral-600 to-neutral-700', icon: '?' };
    }
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

  if (!subscription?.isSubscribed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary-light/5 to-white rounded-2xl shadow-lg border border-neutral-200/50 p-8 md:p-12">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -z-10"></div>

          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 mb-2">
              <XCircleIcon className="w-10 h-10 text-neutral-400" />
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">
                No Active Subscription
              </h3>
              <p className="text-neutral-600 text-lg max-w-md mx-auto">
                Unlock premium features and take your experience to the next level
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-neutral-700">Priority Support</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-neutral-700">Advanced Analytics</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-neutral-700">Unlimited Listings</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                <CheckCircleIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-neutral-700">Premium Placement</span>
              </div>
            </div>

            <button
              onClick={() => {
                dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: false } });
              }}
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

  const statusBadge = getStatusBadge(subscription.subscriptionStatus);
  const sourceBadge = getSourceBadge(subscription.subscriptionSource);

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!subscription.subscriptionExpiresAt) return null;
    const now = new Date();
    const expiry = new Date(subscription.subscriptionExpiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Subscription Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-darker rounded-2xl shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-2xl">{statusBadge.icon}</span>
                <span className="text-white font-bold text-sm">{statusBadge.label}</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-white">
                {subscription.subscriptionProductName || subscription.subscriptionPlan || 'Premium Plan'}
              </h3>

              {subscription.subscriptionSource && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
                  <span className="text-lg">{sourceBadge.icon}</span>
                  <span className="text-white/90 text-sm font-medium">{sourceBadge.text}</span>
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <CheckCircleIcon className="w-16 h-16 md:w-20 md:h-20 text-white/90" />
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Expiration Info */}
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 space-y-4">
          <h4 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Subscription Details
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <span className="text-neutral-600 font-medium">Expires On</span>
              <span className="text-neutral-900 font-bold">
                {formatDate(subscription.subscriptionExpiresAt)}
              </span>
            </div>

            {daysRemaining !== null && (
              <div className="p-4 bg-gradient-to-br from-primary-light to-primary-light/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-primary-dark font-semibold">Time Remaining</span>
                  <span className="text-2xl font-bold text-primary-darker">
                    {daysRemaining < 0 ? (
                      <span className="text-red-600">Expired</span>
                    ) : daysRemaining === 0 ? (
                      'Today'
                    ) : daysRemaining === 1 ? (
                      '1 day'
                    ) : (
                      `${daysRemaining} days`
                    )}
                  </span>
                </div>

                {daysRemaining > 0 && daysRemaining <= 7 && (
                  <p className="text-xs text-primary-dark/80 mt-2">
                    ⚠️ Renew soon to avoid interruption
                  </p>
                )}
              </div>
            )}

            {subscription.subscriptionPlan && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-neutral-600 font-medium">Plan ID</span>
                <code className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-700 font-mono">
                  {subscription.subscriptionPlan}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 space-y-4">
          <h4 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Your Benefits
          </h4>

          <div className="space-y-3">
            {[
              'Priority customer support',
              'Advanced analytics',
              'Unlimited listings',
              'Premium placement'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listing Promotion Options */}
      <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6 space-y-4">
        <h4 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          Listing Promotion Options
        </h4>
        <p className="text-sm text-neutral-600">
          Boost your property listings with paid promotions to get more visibility and inquiries
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {/* Featured */}
          <div className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-neutral-800">Featured</h5>
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">From €19.99</span>
            </div>
            <p className="text-xs text-neutral-600 mb-3">Stand out in search results with priority placement</p>
            <ul className="space-y-1">
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>Top of search results</span>
              </li>
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>Featured badge</span>
              </li>
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>2x visibility</span>
              </li>
            </ul>
          </div>

          {/* Highlight */}
          <div className="border-2 border-neutral-800 rounded-lg p-4 relative">
            <div className="absolute -top-2 right-2 bg-neutral-800 text-white text-xs font-medium px-2 py-0.5 rounded">
              Popular
            </div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-neutral-800">Highlight</h5>
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">From €39.99</span>
            </div>
            <p className="text-xs text-neutral-600 mb-3">Maximum visibility with auto-refresh every 3 days</p>
            <ul className="space-y-1">
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>All Featured benefits</span>
              </li>
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>Auto-refresh to top</span>
              </li>
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>3x visibility</span>
              </li>
            </ul>
          </div>

          {/* Premium */}
          <div className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition-all">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-neutral-800">Premium</h5>
              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">From €79.99</span>
            </div>
            <p className="text-xs text-neutral-600 mb-3">Ultimate exposure with homepage featuring</p>
            <ul className="space-y-1">
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>All Highlight benefits</span>
              </li>
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>Homepage carousel</span>
              </li>
              <li className="text-xs text-neutral-700 flex items-start gap-1.5">
                <span className="text-neutral-400 mt-0.5">•</span>
                <span>5x visibility</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-800 mb-1">How to promote your listings</p>
              <p className="text-xs text-neutral-600">
                When creating a new listing, you'll see a promotion option checkbox. Select it to choose your promotion tier after publishing. You can also promote existing listings from the "My Listings" tab by clicking the "Promote" button.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-md border border-neutral-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="flex-1 px-6 py-3.5 bg-white border-2 border-neutral-300 text-neutral-700 font-bold rounded-xl hover:border-primary hover:text-primary hover:shadow-lg transition-all duration-300"
            onClick={() => {
              // Handle manage subscription
            }}
          >
            Manage Subscription
          </button>
          <button
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            onClick={() => {
              dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: { isOpen: true, isOffer: false } });
            }}
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
