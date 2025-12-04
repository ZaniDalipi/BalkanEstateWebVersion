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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-800 mb-2">
          Promote Your Listing
        </h2>
        <p className="text-neutral-600">
          Get more visibility and inquiries with a promoted listing
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tier Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {(['featured', 'highlight', 'premium'] as PromotionTier[]).map((tierId) => {
          const tier = tiers[tierId];
          const isSelected = selectedTier === tierId;
          const pricing = tiersData.pricing.find(
            (p) => p.tierId === tierId && p.duration === selectedDuration
          );

          return (
            <button
              key={tierId}
              onClick={() => setSelectedTier(tierId)}
              className={`relative p-6 rounded-xl border-2 text-left transition-all transform hover:scale-105 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-neutral-200 bg-white hover:border-primary/50'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="text-3xl p-3 rounded-lg"
                  style={{ backgroundColor: `${tier.color}20` }}
                >
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-800">{tier.name}</h3>
                  <p className="text-2xl font-bold" style={{ color: tier.color }}>
                    €{pricing?.price || 0}
                  </p>
                </div>
              </div>

              <p className="text-sm text-neutral-600 mb-4">{tier.description}</p>

              <ul className="space-y-2">
                {tier.features.slice(0, 5).map((feature, idx) => (
                  <li key={idx} className="text-sm text-neutral-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
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
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">Select Duration</h3>
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
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg font-bold text-neutral-800">{duration} days</div>
                    <div className="text-sm text-neutral-600">€{pricing?.price || 0}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Urgent Badge */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
            <label className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                checked={hasUrgentBadge}
                onChange={(e) => setHasUrgentBadge(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary border-neutral-300 rounded focus:ring-primary"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-neutral-800">
                    {tiersData.urgentModifier.name}
                  </span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    URGENT
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    +€{tiersData.urgentModifier.price}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  {tiersData.urgentModifier.description}
                </p>
                <ul className="space-y-1">
                  {tiersData.urgentModifier.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-neutral-700 flex items-start gap-2">
                      <span className="text-red-500">⚡</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </label>
          </div>

          {/* Agency Allocation */}
          {agencyAllocation && canUseAgencyAllocation() && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAgencyAllocation}
                  onChange={(e) => setUseAgencyAllocation(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-neutral-300 rounded focus:ring-blue-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-neutral-800">
                      Use Agency Allocation
                    </span>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                      FREE
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    Your agency plan ({agencyAllocation.plan.planName}) includes monthly promotion
                    allocations. Use one of your remaining {selectedTier} promotions this month.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Featured:</span>{' '}
                      {agencyAllocation.remaining.featured}/{agencyAllocation.plan.monthlyFeaturedAds}
                    </div>
                    <div>
                      <span className="font-semibold">Highlight:</span>{' '}
                      {agencyAllocation.remaining.highlight}/{agencyAllocation.plan.monthlyHighlightAds}
                    </div>
                    <div>
                      <span className="font-semibold">Premium:</span>{' '}
                      {agencyAllocation.remaining.premium}/{agencyAllocation.plan.monthlyPremiumAds}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Coupon Code */}
          {!useAgencyAllocation && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-neutral-800 mb-4">Have a Coupon Code?</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {validatingCoupon && (
                  <div className="flex items-center px-4 py-2 text-neutral-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              {couponValidation && (
                <div
                  className={`mt-3 p-3 rounded-lg text-sm ${
                    couponValidation.isValid
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {couponValidation.isValid ? (
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>
                        Coupon applied! You save €{couponValidation.discount.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>✗</span>
                      <span>{couponValidation.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-6 mb-6">
            <h3 className="text-lg font-bold text-neutral-800 mb-4">Price Summary</h3>
            <div className="space-y-2">
              {priceInfo.original !== priceInfo.final && (
                <div className="flex justify-between text-neutral-600">
                  <span>Original Price:</span>
                  <span className="line-through">€{priceInfo.original.toFixed(2)}</span>
                </div>
              )}
              {priceInfo.savings > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Total Savings:</span>
                  <span>-€{priceInfo.savings.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-neutral-800 pt-3 border-t border-neutral-300">
                <span>Total:</span>
                <span className="text-primary">
                  €{priceInfo.final.toFixed(2)}
                  {useAgencyAllocation && priceInfo.final === 0 && (
                    <span className="text-sm text-green-600 ml-2">(FREE)</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onSkip}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 transition-colors disabled:opacity-50"
            >
              Skip for Now
            </button>
            <button
              onClick={handlePurchase}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : (
                `Promote Property - €${priceInfo.final.toFixed(2)}`
              )}
            </button>
          </div>
        </>
      )}

      {!selectedTier && (
        <div className="text-center">
          <button
            onClick={onSkip}
            className="px-8 py-3 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 transition-colors"
          >
            Skip Promotion
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionSelector;
