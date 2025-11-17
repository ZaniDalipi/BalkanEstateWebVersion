import React from 'react';
import { getCurrencySymbol } from '../../utils/currency';

interface Product {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingPeriod?: string;
  features: string[];
  badge?: string;
  badgeColor?: string;
  highlighted?: boolean;
}

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  featureType?: string;
  current?: number;
  limit?: number;
  recommendedProducts: Product[];
  onSelectPlan?: (productId: string) => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  title,
  message,
  featureType,
  current,
  limit,
  recommendedProducts,
  onSelectPlan,
}) => {
  if (!isOpen) return null;

  const getBadgeColor = (color?: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  const formatBillingPeriod = (period?: string) => {
    if (!period) return '';
    return `/${period.replace('ly', '')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {current !== undefined && limit !== undefined && (
              <p className="text-sm text-gray-600 mt-1">
                You've used {current} of {limit} {featureType} today
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-lg mb-8">{message}</p>

          {/* Plans Grid */}
          {recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`relative border-2 rounded-lg p-6 transition-all hover:shadow-lg ${
                    product.highlighted
                      ? 'border-purple-500 shadow-md'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(
                          product.badgeColor
                        )}`}
                      >
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {getCurrencySymbol(product.currency)}
                      {product.price}
                    </span>
                    <span className="text-gray-600">
                      {formatBillingPeriod(product.billingPeriod)}
                    </span>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {product.description}
                    </p>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {product.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {product.features.length > 5 && (
                      <li className="text-sm text-gray-500 ml-7">
                        +{product.features.length - 5} more features
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => onSelectPlan?.(product.productId)}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      product.highlighted
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Choose {product.name}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No subscription plans available at this time.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
