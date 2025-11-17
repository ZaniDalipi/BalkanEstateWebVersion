import React from 'react';
import { XMarkIcon, SparklesIcon, LockClosedIcon } from '../../constants';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureType: 'aiSearch' | 'aiDescription' | 'neighborhoodInsights' | 'propertyInsights';
  currentUsage: number;
  limit: number;
  remainingUsage?: number;
}

const featureNames: Record<string, string> = {
  aiSearch: 'AI Property Search',
  aiDescription: 'AI Description Generator',
  neighborhoodInsights: 'Neighborhood Insights',
  propertyInsights: 'Property Insights',
};

const featureDescriptions: Record<string, string> = {
  aiSearch: 'Search for properties using natural language and get instant results',
  aiDescription: 'Generate professional property descriptions from photos automatically',
  neighborhoodInsights: 'Get AI-powered insights about property neighborhoods and amenities',
  propertyInsights: 'View detailed analytics about your property listings performance',
};

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  featureType,
  currentUsage,
  limit,
  remainingUsage,
}) => {
  if (!isOpen) return null;

  const featureName = featureNames[featureType] || featureType;
  const featureDescription = featureDescriptions[featureType] || '';
  const isLimitReached = remainingUsage !== undefined ? remainingUsage <= 0 : currentUsage >= limit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            {isLimitReached ? (
              <LockClosedIcon className="w-8 h-8" />
            ) : (
              <SparklesIcon className="w-8 h-8" />
            )}
            <h2 className="text-2xl font-bold">
              {isLimitReached ? 'Daily Limit Reached' : 'Usage Warning'}
            </h2>
          </div>

          <p className="text-white/90 text-sm">
            {featureName}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Usage Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600">Today's Usage</span>
              <span className="font-semibold text-neutral-900">
                {currentUsage} / {limit}
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isLimitReached ? 'bg-red-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
              />
            </div>
            {remainingUsage !== undefined && remainingUsage > 0 && (
              <p className="text-xs text-neutral-600 mt-1">
                {remainingUsage} {remainingUsage === 1 ? 'use' : 'uses'} remaining today
              </p>
            )}
          </div>

          {/* Message */}
          <div className="bg-primary-light/30 rounded-lg p-4">
            <p className="text-neutral-800 text-sm leading-relaxed">
              {isLimitReached ? (
                <>
                  You've reached your daily limit of <strong>{limit}</strong> free uses for{' '}
                  <strong>{featureName}</strong>. Upgrade to Premium for unlimited access!
                </>
              ) : (
                <>
                  You have <strong>{remainingUsage}</strong> {remainingUsage === 1 ? 'use' : 'uses'} remaining today.
                  Upgrade to Premium for unlimited access to all AI features!
                </>
              )}
            </p>
          </div>

          {/* Premium Benefits */}
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-900 text-sm">Premium Benefits:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span className="text-neutral-700">Unlimited AI Property Search</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span className="text-neutral-700">Unlimited AI Description Generator</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span className="text-neutral-700">Unlimited Neighborhood Insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span className="text-neutral-700">Unlimited Property Analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span className="text-neutral-700">Priority Support</span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-lg p-4 border-2 border-primary">
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-3xl font-bold text-primary">€1.50</span>
              <span className="text-neutral-600 text-sm">/year</span>
            </div>
            <p className="text-center text-xs text-neutral-600">
              Less than €0.13 per month!
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                onClose();
                onUpgrade();
              }}
              className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-md"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitModal;
