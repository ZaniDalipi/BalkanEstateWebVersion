import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import PaymentWindow from './PaymentWindow';
import { 
  SparklesIcon, 
  BoltIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  XMarkIcon,
  CheckCircleIcon,
  FireIcon
} from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { Property } from '../../types';
import { fetchSellerProducts, Product } from '../../utils/api';
import './PromotionOfferModal.css';

interface PromotionOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onPromotionComplete?: (success: boolean) => void;
}

interface PlanDetails {
  name: string;
  price: number;
  productId: string;
  features: string[];
  duration: string;
  badge?: string;
}

const PromotionOfferModal: React.FC<PromotionOfferModalProps> = ({
  isOpen,
  onClose,
  property,
  onPromotionComplete
}) => {
  const { state, dispatch } = useAppContext();
  const { currentUser, isAuthenticated } = state;
  
  // State Management
  const [showPaymentWindow, setShowPaymentWindow] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingPromotion, setActivatingPromotion] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null);
  const [timer, setTimer] = useState(300); // 5-minute countdown
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  // Memoized Data
  const promotionFeatures = useMemo(() => [
    { icon: StarIcon, text: "Featured badge with animation", highlight: true },
    { icon: TrendingUpIcon, text: "Top placement in search results", highlight: true },
    { icon: UsersIcon, text: "Priority in buyer alerts & notifications", highlight: true },
    { icon: ShieldCheckIcon, text: "Verified seller badge included", highlight: false },
    { icon: ChartBarIcon, text: "Detailed analytics dashboard", highlight: false },
    { icon: ClockIcon, text: "24/7 premium support access", highlight: false },
    { icon: FireIcon, text: "Social media promotion boost", highlight: false },
    { icon: SparklesIcon, text: "Mobile app push notifications", highlight: false }
  ], []);

  const successStories = useMemo(() => [
    { name: "Sarah M.", role: "Property Seller", result: "Sold in 5 days", quote: "The promotion generated 23 serious inquiries!" },
    { name: "John D.", role: "Real Estate Agent", result: "30% higher price", quote: "Featured listing attracted premium buyers" },
    { name: "Lisa R.", role: "First-time Seller", result: "12 offers received", quote: "Best investment for selling quickly" }
  ], []);

  const stats = useMemo(() => [
    { value: "312%", label: "More Views", color: "from-blue-500 to-cyan-400", icon: TrendingUpIcon },
    { value: "215%", label: "More Inquiries", color: "from-green-500 to-emerald-400", icon: UsersIcon },
    { value: "47%", label: "Faster Sale", color: "from-amber-500 to-orange-400", icon: BoltIcon },
    { value: "28%", label: "Higher Price", color: "from-purple-500 to-pink-400", icon: ChartBarIcon }
  ], []);

  // Countdown Timer Effect
  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  // Fetch Products
  useEffect(() => {
    if (isOpen && products.length === 0) {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const fetchedProducts = await fetchSellerProducts();
          setProducts(fetchedProducts);
          // Simulate network delay for better UX
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
          console.error('Failed to load products:', error);
        } finally {
          setLoading(false);
        }
      };
      loadProducts();
    }
  }, [isOpen, products.length]);

  // Reset state
  useEffect(() => {
    if (isOpen) {
      setTimer(300);
      setShowPaymentWindow(false);
      setShowPaymentError(false);
      setPaymentErrorMessage('');
      setSelectedPlan(null);
      setActivatingPromotion(false);
    }
  }, [isOpen]);

  // Get promotion product
  const promotionProduct = useMemo(() => 
    products.find(p => p.productId === 'premium_promotion_30days') ||
    products.find(p => p.productId.includes('promotion')),
    [products]
  );

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handlePromote = useCallback((plan?: PlanDetails) => {
    if (!property) return;

    if (!isAuthenticated || !currentUser) {
      onClose();
      dispatch({
        type: 'TOGGLE_AUTH_MODAL',
        payload: { 
          isOpen: true, 
          view: 'login'
        },
      });
      return;
    }

    const defaultPlan: PlanDetails = {
      name: "Premium 30-Day Promotion",
      price: promotionProduct?.price || 49,
      productId: promotionProduct?.productId || 'premium_promotion_30days',
      features: promotionFeatures.map(f => f.text),
      duration: "30 days",
      badge: "BEST VALUE"
    };

    setSelectedPlan(plan || defaultPlan);
    setShowPaymentWindow(true);
  }, [property, isAuthenticated, currentUser, promotionProduct, promotionFeatures, onClose, dispatch]);

  const handleSkipPromotion = useCallback(() => {
    dispatch({
      type: 'SHOW_TOAST',
      payload: {
        type: 'info',
        message: 'You can promote your listing anytime from your dashboard',
        duration: 4000
      }
    });
    onPromotionComplete?.(false);
    onClose();
  }, [onPromotionComplete, onClose, dispatch]);

  const handlePaymentSuccess = useCallback((paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setShowPaymentWindow(false);
    onPromotionComplete?.(true);
    onClose();
  }, [onPromotionComplete, onClose]);

  const handlePaymentError = useCallback((errorMessage: string) => {
    setPaymentErrorMessage(errorMessage);
    setShowPaymentError(true);
    setShowPaymentWindow(false);
  }, []);

  // Loading Skeleton
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={handleSkipPromotion} size="2xl">
        <div className="min-h-[600px] bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto"></div>
              <SparklesIcon className="w-12 h-12 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-gray-900">Preparing Your Promotion Options</h3>
            <p className="mt-2 text-gray-600">Finding the best ways to showcase your property...</p>
          </div>
        </div>
      </Modal>
    );
  }

  // Error State
  if (showPaymentError) {
    return (
      <Modal isOpen={isOpen} onClose={handleSkipPromotion} title="Payment Processing">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <XMarkIcon className="w-10 h-10 text-red-500" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Payment Not Completed</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {paymentErrorMessage || "We couldn't process your payment. Please try again or use a different method."}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setShowPaymentError(false)}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Try Payment Again
            </button>
            <button
              onClick={handleSkipPromotion}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Skip for Now
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Need immediate assistance?</p>
            <div className="flex items-center justify-center gap-4">
              <a href="tel:+15551234567" className="text-primary hover:text-primary-dark font-medium">
                📞 Call Support
              </a>
              <a href="mailto:premium-support@realestate.com" className="text-primary hover:text-primary-dark font-medium">
                ✉️ Email Us
              </a>
            </div>
          </div>
        </motion.div>
      </Modal>
    );
  }

  return (
    <>
      <Modal 
        isOpen={isOpen && !showPaymentWindow} 
        onClose={handleSkipPromotion} 
        size="5xl"
      >
        <div className="promotion-modal-container">
          {/* Header with Timer */}
          <div className="promotion-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="promotion-badge">
                  <SparklesIcon className="w-5 h-5" />
                  <span>LIMITED OFFER</span>
                </div>
                <div className="timer-badge">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatTime(timer)}</span>
                </div>
              </div>
              <button
                onClick={handleSkipPromotion}
                className="close-button"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Left Column - Success & Stats */}
            <div className="left-column">
              {/* Success Message */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="success-card"
              >
                <div className="success-icon">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="success-title">🎉 Listing Published Successfully!</h3>
                  <p className="success-subtitle">
                    Your property is now live! Take it to the next level with premium promotion.
                  </p>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="stats-grid">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="stat-card"
                    >
                      <div className={`stat-icon-bg bg-gradient-to-br ${stat.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="stat-content">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Success Stories */}
              <div className="testimonials-section">
                <h4 className="testimonials-title">Success Stories</h4>
                <div className="testimonials-grid">
                  {successStories.map((story, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className="testimonial-card"
                    >
                      <div className="testimonial-header">
                        <div className="avatar">
                          {story.name.charAt(0)}
                        </div>
                        <div>
                          <p className="testimonial-name">{story.name}</p>
                          <p className="testimonial-role">{story.role}</p>
                        </div>
                        <span className="testimonial-result">{story.result}</span>
                      </div>
                      <p className="testimonial-quote">"{story.quote}"</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Promotion Offer */}
            <div className="right-column">
              <div className="promotion-content">
                {/* Main Promotion Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="premium-offer-card"
                >
                  <div className="offer-badge">
                    <FireIcon className="w-5 h-5" />
                    <span>HOT DEAL</span>
                  </div>

                  <div className="offer-header">
                    <h2 className="offer-title">Premium Promotion</h2>
                    <p className="offer-subtitle">Maximum exposure for your property</p>
                  </div>

                  <div className="price-section">
                    <div className="price-display">
                      <span className="price-currency">$</span>
                      <span className="price-amount">{promotionProduct?.price || 49}</span>
                      <span className="price-period">/ 30 days</span>
                    </div>
                    <div className="price-savings">
                      <span className="original-price">$99</span>
                      <span className="discount-badge">50% OFF</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="features-list">
                    {promotionFeatures.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className={`feature-item ${feature.highlight ? 'feature-highlight' : ''}`}
                          onMouseEnter={() => setHoveredFeature(index)}
                          onMouseLeave={() => setHoveredFeature(null)}
                        >
                          <div className="feature-icon">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="feature-text">{feature.text}</span>
                          {feature.highlight && (
                            <span className="popular-badge">POPULAR</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Guarantees */}
                  <div className="guarantees-section">
                    <div className="guarantee-item">
                      <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                      <span>30-Day Money-Back Guarantee</span>
                    </div>
                    <div className="guarantee-item">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      <span>No Automatic Renewal</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePromote()}
                    className="premium-cta-button"
                  >
                    <div className="cta-content">
                      <SparklesIcon className="w-6 h-6" />
                      <div>
                        <span className="cta-main">Boost My Listing</span>
                        <span className="cta-sub">Only ${promotionProduct?.price || 49} • One-time payment</span>
                      </div>
                    </div>
                    <BoltIcon className="w-5 h-5" />
                  </motion.button>

                  {/* Alternative Option */}
                  <div className="alternative-section">
                    <p className="alternative-text">Or start with a basic promotion</p>
                    <button
                      onClick={() => handlePromote({
                        name: "Basic 15-Day Promotion",
                        price: 19,
                        productId: 'basic_promotion_15days',
                        features: promotionFeatures.slice(0, 4).map(f => f.text),
                        duration: "15 days"
                      })}
                      className="alternative-button"
                    >
                      Basic Promotion - $19
                    </button>
                  </div>
                </motion.div>

                {/* Security Footer */}
                <div className="security-footer">
                  <div className="security-icons">
                    <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                    <span>Secure Payment</span>
                    <span className="security-divider">•</span>
                    <span>256-bit SSL Encryption</span>
                    <span className="security-divider">•</span>
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Premium Payment Window */}
      <AnimatePresence>
        {selectedPlan && showPaymentWindow && (
          <PaymentWindow
            isOpen={showPaymentWindow}
            onClose={() => {
              setShowPaymentWindow(false);
              setSelectedPlan(null);
            }}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            planInterval="once"
            userRole={(['buyer', 'agent', 'private_seller'].includes(currentUser?.role) ? currentUser?.role : 'private_seller') as 'buyer' | 'agent' | 'private_seller'}
            userEmail={currentUser?.email}
            userCountry={currentUser?.country || 'RS'}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            productId={selectedPlan.productId}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PromotionOfferModal;