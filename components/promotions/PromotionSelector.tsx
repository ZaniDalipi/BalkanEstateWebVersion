import React, { useState, useEffect } from 'react';
import * as api from '../../services/apiService';

interface PromotionSelectorProps {
  propertyId: string;
  onSuccess: () => void;
  onSkip: () => void;
}

type PromotionTier = 'featured' | 'highlight' | 'premium';
type PromotionDuration = 7 | 15 | 30 | 60 | 90;

const PromotionSelector: React.FC<PromotionSelectorProps> = ({
  propertyId,
  onSuccess,
  onSkip,
}) => {
  const [tiersData, setTiersData] = useState<api.PromotionTiersResponse | null>(null);
  const [agencyAllocation, setAgencyAllocation] = useState<api.AgencyAllocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedTier, setSelectedTier] = useState<PromotionTier | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<PromotionDuration>(30);
  const [hasUrgentBadge, setHasUrgentBadge] = useState(false);
  const [useAgencyAllocation, setUseAgencyAllocation] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<api.CouponValidationResult | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Load promotion tiers and agency allocation
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const tiers = await api.getPromotionTiers();
        setTiersData(tiers);

        // Try to load agency allocation (only works for agency owners)
        try {
          const allocation = await api.getAgencyAllocation();
          setAgencyAllocation(allocation.allocation);
        } catch (err) {
          // Not an agency owner, that's fine
          setAgencyAllocation(null);
        }
      } catch (err: any) {
        setError('Failed to load promotion options');
        console.error('Load promotion data error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Validate coupon when code changes
  useEffect(() => {
    const validateCouponCode = async () => {
      if (!couponCode || !selectedTier) {
        setCouponValidation(null);
        return;
      }

      setValidatingCoupon(true);
      try {
        const price = calculateBasePrice();
        const result = await api.validateCoupon(couponCode, selectedTier, price);
        setCouponValidation(result);
      } catch (err: any) {
        setCouponValidation({
          isValid: false,
          discount: 0,
          discountType: 'fixed',
          discountValue: 0,
          message: err.message || 'Invalid coupon code',
        });
      } finally {
        setValidatingCoupon(false);
      }
    };

    const debounce = setTimeout(validateCouponCode, 500);
    return () => clearTimeout(debounce);
  }, [couponCode, selectedTier, selectedDuration]);

  // Calculate base price
  const calculateBasePrice = (): number => {
    if (!tiersData || !selectedTier) return 0;

    const pricingEntry = tiersData.pricing.find(
      (p) => p.tierId === selectedTier && p.duration === selectedDuration
    );

    let price = pricingEntry?.price || 0;
    if (hasUrgentBadge) {
      price += tiersData.urgentModifier.price;
    }

    return price;
  };

  // Calculate final price with discounts
  const calculateFinalPrice = (): { original: number; final: number; savings: number } => {
    const originalPrice = calculateBasePrice();
    let finalPrice = originalPrice;
    let savings = 0;

    // If using agency allocation, price is 0 (except urgent badge)
    if (useAgencyAllocation && selectedTier) {
      const urgentCost = hasUrgentBadge ? (tiersData?.urgentModifier.price || 0) : 0;
      finalPrice = urgentCost;
      savings = originalPrice - finalPrice;
    } else {
      // Apply agency discount if applicable
      if (agencyAllocation && agencyAllocation.plan.discountPercentage > 0) {
        const discount = (originalPrice * agencyAllocation.plan.discountPercentage) / 100;
        finalPrice = originalPrice - discount;
        savings = discount;
      }

      // Apply coupon if valid
      if (couponValidation?.isValid) {
        const couponDiscount = couponValidation.discount;
        finalPrice = Math.max(0, finalPrice - couponDiscount);
        savings += couponDiscount;
      }
    }

    return { original: originalPrice, final: finalPrice, savings };
  };

  // Check if agency allocation is available for selected tier
  const canUseAgencyAllocation = (): boolean => {
    if (!agencyAllocation || !selectedTier) return false;

    const remaining = agencyAllocation.remaining;
    if (selectedTier === 'featured') return remaining.featured > 0;
    if (selectedTier === 'highlight') return remaining.highlight > 0;
    if (selectedTier === 'premium') return remaining.premium > 0;
    return false;
  };

  // Handle promotion purchase
  const handlePurchase = async () => {
    if (!selectedTier) {
      setError('Please select a promotion tier');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.purchasePromotion({
        propertyId,
        promotionTier: selectedTier,
        duration: selectedDuration,
        hasUrgentBadge,
        useAgencyAllocation,
        couponCode: couponCode || undefined,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to purchase promotion');
      console.error('Purchase promotion error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tiersData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Failed to load promotion options'}</p>
        <button
          onClick={onSkip}
          className="mt-4 px-6 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300"
        >
          Skip for Now
        </button>
      </div>
    );
  }

  const priceInfo = calculateFinalPrice();
  const tiers = tiersData.tiers;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          Promote Your Listing
        </h2>
        <p className="text-neutral-600 text-sm">
          Increase visibility and get more inquiries by choosing a promotion tier
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Tier Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {(['featured', 'highlight', 'premium'] as PromotionTier[]).map((tierId) => {
          const tier = tiers[tierId];
          const isSelected = selectedTier === tierId;
          const pricing = tiersData.pricing.find(
            (p) => p.tierId === tierId && p.duration === selectedDuration
          );

          // Define tier-specific colors
          const tierColors = {
            featured: {
              gradient: 'from-blue-50 to-blue-100',
              border: isSelected ? 'border-blue-600' : 'border-blue-300',
              borderHover: 'hover:border-blue-500',
              text: 'text-blue-900',
              priceText: 'text-blue-900',
              featureText: 'text-blue-800',
              checkmark: 'text-blue-500',
              badge: 'bg-blue-600',
              icon: '⭐',
            },
            highlight: {
              gradient: 'from-amber-50 to-amber-100',
              border: isSelected ? 'border-amber-600' : 'border-amber-400',
              borderHover: 'hover:border-amber-500',
              text: 'text-amber-900',
              priceText: 'text-amber-900',
              featureText: 'text-amber-800',
              checkmark: 'text-amber-500',
              badge: 'bg-amber-600',
              icon: '💎',
            },
            premium: {
              gradient: 'from-purple-50 to-purple-100',
              border: isSelected ? 'border-purple-600' : 'border-purple-300',
              borderHover: 'hover:border-purple-500',
              text: 'text-purple-900',
              priceText: 'text-purple-900',
              featureText: 'text-purple-800',
              checkmark: 'text-purple-500',
              badge: 'bg-purple-600',
              icon: '👑',
            },
          };

          const colors = tierColors[tierId];

          return (
            <button
              key={tierId}
              onClick={() => setSelectedTier(tierId)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all bg-gradient-to-br shadow-md hover:shadow-lg ${colors.gradient} ${colors.border} ${colors.borderHover}`}
            >
              {tier.highlight && (
                <div className="absolute -top-2 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className={`text-xl font-bold ${colors.text} mb-2 flex items-center gap-2`}>
                  <span>{colors.icon}</span>
                  {tier.name}
                </h3>
                <p className={`text-3xl font-bold ${colors.priceText}`}>
                  €{pricing?.price || 0}
                </p>
              </div>

              <p className={`text-sm ${colors.featureText} mb-4 font-medium`}>{tier.description}</p>

              <ul className="space-y-2">
                {tier.features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className={`text-sm ${colors.featureText} flex items-start gap-2 font-medium`}>
                    <span className={`${colors.checkmark} font-bold`}>✓</span>
                    <span>{typeof feature === 'string' ? feature : feature.name}</span>
                  </li>
                ))}
              </ul>

              {isSelected && (
                <div className="absolute top-5 right-5">
                  <div className={`w-6 h-6 ${colors.badge} rounded-full flex items-center justify-center shadow-md`}>
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedTier && (
        <>
          {/* Duration Selection */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-5 mb-4 shadow-sm">
            <h3 className="text-base font-bold text-green-900 mb-4 flex items-center gap-2">
              <span>⏱️</span>
              Select Duration
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {([7, 15, 30, 60, 90] as PromotionDuration[]).map((duration) => {
                const isSelected = selectedDuration === duration;
                const pricing = tiersData.pricing.find(
                  (p) => p.tierId === selectedTier && p.duration === duration
                );

                return (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-green-600 bg-green-100 text-green-900'
                        : 'border-green-200 bg-white hover:border-green-400 text-gray-700'
                    }`}
                  >
                    <div className="font-bold">{duration} days</div>
                    <div className="text-xs font-bold mt-1">€{pricing?.price || 0}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgent Badge */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasUrgentBadge}
                onChange={(e) => setHasUrgentBadge(e.target.checked)}
                className="mt-1 w-4 h-4 text-neutral-800 border-neutral-300 rounded focus:ring-neutral-800"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-neutral-800">
                    {tiersData.urgentModifier.name}
                  </span>
                  <span className="bg-neutral-800 text-white text-xs font-medium px-2 py-0.5 rounded">
                    Urgent
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    +€{tiersData.urgentModifier.price}
                  </span>
                </div>
                <p className="text-xs text-neutral-600">
                  {tiersData.urgentModifier.description}
                </p>
              </div>
            </label>
          </div>

          {/* Agency Allocation */}
          {agencyAllocation && canUseAgencyAllocation() && (
            <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-5 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAgencyAllocation}
                  onChange={(e) => setUseAgencyAllocation(e.target.checked)}
                  className="mt-1 w-4 h-4 text-neutral-800 border-neutral-300 rounded focus:ring-neutral-800"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-neutral-800">
                      Use Agency Allocation
                    </span>
                    <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                      Free
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mb-2">
                    Your {agencyAllocation.plan.planName} plan includes monthly promotions. Use one of your remaining {selectedTier} slots this month.
                  </p>
                  <div className="flex gap-3 text-xs text-neutral-700">
                    <div>
                      Featured: {agencyAllocation.remaining.featured}/{agencyAllocation.plan.monthlyFeaturedAds}
                    </div>
                    <div>
                      Highlight: {agencyAllocation.remaining.highlight}/{agencyAllocation.plan.monthlyHighlightAds}
                    </div>
                    <div>
                      Premium: {agencyAllocation.remaining.premium}/{agencyAllocation.plan.monthlyPremiumAds}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Coupon Code */}
          {!useAgencyAllocation && (
            <div className="bg-white rounded-lg border border-neutral-200 p-5 mb-4">
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">Coupon Code</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800"
                />
                {validatingCoupon && (
                  <div className="flex items-center px-3 py-2 text-neutral-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-800"></div>
                  </div>
                )}
              </div>
              {couponValidation && (
                <div
                  className={`mt-2 p-2 rounded text-xs ${
                    couponValidation.isValid
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {couponValidation.isValid ? (
                    <span>
                      Coupon applied! You save €{couponValidation.discount.toFixed(2)}
                    </span>
                  ) : (
                    <span>{couponValidation.message}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-neutral-50 rounded-lg border border-neutral-300 p-5 mb-6">
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              {priceInfo.original !== priceInfo.final && (
                <div className="flex justify-between text-neutral-600">
                  <span>Original Price:</span>
                  <span className="line-through">€{priceInfo.original.toFixed(2)}</span>
                </div>
              )}
              {priceInfo.savings > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Savings:</span>
                  <span>-€{priceInfo.savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                <span>Total:</span>
                <span>
                  €{priceInfo.final.toFixed(2)}
                  {useAgencyAllocation && priceInfo.final === 0 && (
                    <span className="text-sm text-green-600 ml-2 font-normal">(Free)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              disabled={submitting}
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 shadow-sm"
            >
              Skip
            </button>
            <button
              onClick={handlePurchase}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-base font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                `🚀 Continue - €${priceInfo.final.toFixed(2)}`
              )}
            </button>
          </div>
        </>
      )}

      {!selectedTier && (
        <div className="text-center">
          <button
            onClick={onSkip}
            className="px-6 py-2.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Skip for Now
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionSelector;
