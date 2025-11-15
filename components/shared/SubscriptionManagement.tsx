import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';

interface SubscriptionManagementProps {
  userId: string;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ userId }) => {
  const { state } = useAppContext();
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'trial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'grace':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case 'google':
        return { text: 'Google Play', color: 'bg-green-600' };
      case 'apple':
        return { text: 'App Store', color: 'bg-blue-600' };
      case 'stripe':
        return { text: 'Stripe', color: 'bg-purple-600' };
      case 'web':
        return { text: 'Web', color: 'bg-indigo-600' };
      default:
        return { text: 'Unknown', color: 'bg-neutral-600' };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-neutral-600">Loading subscription...</p>
      </div>
    );
  }

  if (!subscription?.isSubscribed) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
        <XCircleIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-neutral-800 mb-2">No Active Subscription</h3>
        <p className="text-neutral-600 mb-6">
          You don't have an active subscription. Upgrade now to unlock premium features!
        </p>
        <button
          onClick={() => {
            // Trigger subscription modal
            // This could be handled via context or props
          }}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
        >
          View Plans
        </button>
      </div>
    );
  }

  const sourceBadge = getSourceBadge(subscription.subscriptionSource);

  return (
    <div className="space-y-6">
      {/* Current Subscription Card */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {subscription.subscriptionProductName || subscription.subscriptionPlan || 'Premium Plan'}
              </h3>
              <p className="text-primary-light opacity-90">Active Subscription</p>
            </div>
            <CheckCircleIcon className="w-12 h-12" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 font-medium">Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(subscription.subscriptionStatus)}`}>
              {subscription.subscriptionStatus?.toUpperCase() || 'ACTIVE'}
            </span>
          </div>

          {/* Plan ID */}
          {subscription.subscriptionPlan && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 font-medium">Plan ID</span>
              <span className="text-neutral-800 font-mono text-sm">
                {subscription.subscriptionPlan}
              </span>
            </div>
          )}

          {/* Subscription Source */}
          {subscription.subscriptionSource && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 font-medium">Source</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${sourceBadge.color}`}>
                {sourceBadge.text}
              </span>
            </div>
          )}

          {/* Expiration Date */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-600 font-medium">Expires On</span>
            <span className="text-neutral-800 font-semibold">
              {formatDate(subscription.subscriptionExpiresAt)}
            </span>
          </div>

          {/* Days Remaining */}
          {subscription.subscriptionExpiresAt && (
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-neutral-700 font-medium">Time Remaining</span>
                <span className="text-lg font-bold text-primary">
                  {(() => {
                    const now = new Date();
                    const expiry = new Date(subscription.subscriptionExpiresAt);
                    const diffTime = expiry.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays < 0) {
                      return 'Expired';
                    } else if (diffDays === 0) {
                      return 'Expires Today';
                    } else if (diffDays === 1) {
                      return '1 day';
                    } else {
                      return `${diffDays} days`;
                    }
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-200">
          <div className="flex gap-4">
            <button
              className="flex-1 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
              onClick={() => {
                // Handle manage subscription
              }}
            >
              Manage Subscription
            </button>
            <button
              className="flex-1 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              onClick={() => {
                // Handle upgrade/change plan
              }}
            >
              Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Features */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h4 className="text-lg font-bold text-neutral-800 mb-4">Your Benefits</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-neutral-700">Priority customer support</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-neutral-700">Advanced analytics and insights</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-neutral-700">Unlimited listings (depends on plan)</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-neutral-700">Premium placement in search results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
