import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import Modal from './Modal';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
} from '../../constants';
import { getPaymentConfigForUser, getAvailablePaymentMethods, STRIPE_CONFIG, PaymentMethod } from '../../config/paymentConfig';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

interface PaymentWindowProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  planInterval: 'month' | 'year';
  userRole: 'buyer' | 'private_seller' | 'agent';
  userEmail?: string;
  userCountry?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  discountPercent?: number;
}

// Payment method icon mapping
const PaymentMethodIcon: React.FC<{ methodId: string; className?: string }> = ({ methodId, className = 'w-5 h-5' }) => {
  switch (methodId) {
    case 'card':
      return <CreditCardIcon className={className} />;
    case 'sepa_debit':
    case 'ideal':
    case 'bancontact':
    case 'giropay':
    case 'eps':
      return <BanknotesIcon className={className} />;
    case 'apple_pay':
    case 'google_pay':
      return <DevicePhoneMobileIcon className={className} />;
    default:
      return <CreditCardIcon className={className} />;
  }
};

// Stripe Payment Form Component
const PaymentForm: React.FC<{
  planName: string;
  planPrice: number;
  userRole: 'buyer' | 'private_seller' | 'agent';
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onProcessing: (isProcessing: boolean) => void;
}> = ({ planName, planPrice, userRole, onSuccess, onError, onProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    onProcessing(true);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
      onError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      onProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element - Stripe's unified payment UI */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            business: {
              name: 'Balkan Estate',
            },
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Payment Error</p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${
          isLoading
            ? 'bg-neutral-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:scale-[1.02]'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay €${planPrice.toFixed(2)}`
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
        <LockClosedIcon className="w-4 h-4" />
        <span>Secured by Stripe • SSL Encrypted</span>
      </div>
    </form>
  );
};

// Main Payment Window Component
const PaymentWindow: React.FC<PaymentWindowProps> = ({
  isOpen,
  onClose,
  planName,
  planPrice,
  planInterval,
  userRole,
  userEmail,
  userCountry = 'RS', // Default to Serbia
  onSuccess,
  onError,
  discountPercent = 0,
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);

  const finalPrice = discountPercent > 0
    ? planPrice * (1 - discountPercent / 100)
    : planPrice;

  const savings = planPrice - finalPrice;

  useEffect(() => {
    if (isOpen) {
      // Get available payment methods for this user
      const methods = getAvailablePaymentMethods(userRole, finalPrice, userCountry);
      setAvailableMethods(methods);

      // Create payment intent
      createPaymentIntent();
    } else {
      // Reset state when modal closes
      setShowSuccess(false);
      setClientSecret('');
    }
  }, [isOpen, userRole, finalPrice, userCountry]);

  const createPaymentIntent = async () => {
    setIsLoadingIntent(true);
    try {
      // TODO: Replace with actual API call to your backend
      // For now, this is a mock that demonstrates the structure
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
        },
        body: JSON.stringify({
          amount: Math.round(finalPrice * 100), // Convert to cents
          currency: 'eur',
          planName,
          planInterval,
          userEmail,
        }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      onError('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoadingIntent(false);
    }
  };

  const handleSuccess = (paymentIntentId: string) => {
    setShowSuccess(true);
    setTimeout(() => {
      onSuccess(paymentIntentId);
      onClose();
    }, 2000);
  };

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0066CC',
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" title="">
      <div className="relative">
        {/* Success Screen */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center rounded-lg p-8">
            <div className="bg-green-100 rounded-full p-4 mb-4">
              <CheckCircleIcon className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Payment Successful!</h3>
            <p className="text-neutral-600 text-center">
              Your subscription has been activated. Redirecting...
            </p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
            Complete Your Purchase
          </h2>
          <p className="text-neutral-600">
            Subscribe to <span className="font-semibold text-neutral-900">{planName}</span>
          </p>
        </div>

        {/* Plan Summary */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 mb-8 border border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-neutral-700 font-medium">{planName}</span>
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              {discountPercent > 0 && (
                <span className="text-lg text-neutral-500 line-through mr-3">
                  €{planPrice.toFixed(2)}
                </span>
              )}
              <span className="text-3xl font-extrabold text-neutral-900">
                €{finalPrice.toFixed(2)}
              </span>
              <span className="text-neutral-600 ml-2">/{planInterval}</span>
            </div>
            {savings > 0 && (
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">
                  You save €{savings.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Available Payment Methods Info */}
        {availableMethods.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-neutral-700 mb-3">Available Payment Methods:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableMethods.slice(0, 6).map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-2 p-3 bg-white rounded-lg border border-neutral-200 hover:border-primary transition-colors"
                >
                  <PaymentMethodIcon methodId={method.id} className="w-5 h-5 text-neutral-600" />
                  <span className="text-xs font-medium text-neutral-700 truncate">
                    {method.name}
                  </span>
                </div>
              ))}
            </div>
            {availableMethods.length > 6 && (
              <p className="text-xs text-neutral-500 mt-2 text-center">
                +{availableMethods.length - 6} more options available
              </p>
            )}
          </div>
        )}

        {/* Payment Form */}
        {isLoadingIntent ? (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="animate-spin h-10 w-10 text-primary mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-neutral-600">Loading payment options...</p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <PaymentForm
              planName={planName}
              planPrice={finalPrice}
              userRole={userRole}
              onSuccess={handleSuccess}
              onError={onError}
              onProcessing={setIsProcessing}
            />
          </Elements>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <XCircleIcon className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-neutral-700 font-semibold mb-2">Unable to load payment</p>
            <p className="text-sm text-neutral-600 mb-4">Please try again or contact support</p>
            <button
              onClick={createPaymentIntent}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Money-back Guarantee */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium">30-day money-back guarantee • Cancel anytime</span>
          </div>
        </div>

        {/* Cancel Link */}
        {!isProcessing && (
          <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Cancel and go back
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentWindow;
