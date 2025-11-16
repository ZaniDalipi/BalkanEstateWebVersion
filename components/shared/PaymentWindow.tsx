import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
} from '../../constants';
import { getPaymentConfigForUser, getAvailablePaymentMethods, PaymentMethod } from '../../config/paymentConfig';

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

// Mock Payment Form Component
const MockPaymentForm: React.FC<{
  planName: string;
  planPrice: number;
  planInterval: 'month' | 'year';
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onProcessing: (isProcessing: boolean) => void;
}> = ({ planName, planPrice, planInterval, onSuccess, onError, onProcessing }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'sepa' | 'paypal'>('card');

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value.replace(/\D/g, ''));
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCvc(value);
  };

  const validateForm = (): boolean => {
    if (selectedMethod === 'card') {
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length !== 16) {
        setErrorMessage('Please enter a valid 16-digit card number');
        return false;
      }
      if (expiryDate.length !== 5) {
        setErrorMessage('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      if (cvc.length !== 3) {
        setErrorMessage('Please enter a valid 3-digit CVC');
        return false;
      }
      if (!cardholderName.trim()) {
        setErrorMessage('Please enter the cardholder name');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    onProcessing(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please log in to complete your purchase');
      }

      // Call backend API to process payment
      const response = await fetch('http://localhost:5001/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          planName,
          planInterval,
          amount: planPrice,
          paymentMethod: selectedMethod,
          // Mock payment details
          paymentDetails: {
            cardNumber: selectedMethod === 'card' ? cardNumber.replace(/\s/g, '') : undefined,
            expiryDate: selectedMethod === 'card' ? expiryDate : undefined,
            cardholderName: selectedMethod === 'card' ? cardholderName : undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      // Success!
      const paymentId = data.payment?.id || data.subscription?.id || 'success_' + Date.now();
      onSuccess(paymentId);

    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      onError(error.message);
    } finally {
      setIsLoading(false);
      onProcessing(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-neutral-900 placeholder:text-neutral-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-neutral-700">Payment Method</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === 'card'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <CreditCardIcon className="w-6 h-6 mx-auto mb-2 text-neutral-700" />
            <p className="text-xs font-medium text-neutral-700">Card</p>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('sepa')}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === 'sepa'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <BanknotesIcon className="w-6 h-6 mx-auto mb-2 text-neutral-700" />
            <p className="text-xs font-medium text-neutral-700">Bank</p>
          </button>
          <button
            type="button"
            onClick={() => setSelectedMethod('paypal')}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedMethod === 'paypal'
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <DevicePhoneMobileIcon className="w-6 h-6 mx-auto mb-2 text-neutral-700" />
            <p className="text-xs font-medium text-neutral-700">Digital</p>
          </button>
        </div>
      </div>

      {/* Card Payment Form */}
      {selectedMethod === 'card' && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-semibold text-neutral-700 mb-2">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                className={inputClasses}
                required
              />
              <CreditCardIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-semibold text-neutral-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-semibold text-neutral-700 mb-2">
                CVC
              </label>
              <input
                type="text"
                id="cvc"
                value={cvc}
                onChange={handleCvcChange}
                placeholder="123"
                className={inputClasses}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="cardholderName" className="block text-sm font-semibold text-neutral-700 mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              id="cardholderName"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
              className={inputClasses}
              required
            />
          </div>
        </div>
      )}

      {/* SEPA Bank Transfer */}
      {selectedMethod === 'sepa' && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
          <div className="text-center py-8">
            <BanknotesIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">SEPA Bank Transfer</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Complete your payment via bank transfer. Processing takes 3-5 business days.
            </p>
            <div className="bg-neutral-50 rounded-lg p-4 text-left text-sm space-y-2">
              <p><span className="font-semibold">Bank:</span> Balkan Estate Bank</p>
              <p><span className="font-semibold">IBAN:</span> RS35 1234 5678 9012 3456</p>
              <p><span className="font-semibold">Reference:</span> {planName}</p>
            </div>
          </div>
        </div>
      )}

      {/* PayPal / Digital Wallet */}
      {selectedMethod === 'paypal' && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Choose Payment Method</h3>
            <p className="text-sm text-neutral-600 mb-6">
              Select your preferred digital wallet
            </p>
            <div className="space-y-3">
              {/* Apple Pay Button */}
              <button
                type="button"
                onClick={() => {
                  alert('Apple Pay integration would open here. You would be redirected to Apple Pay checkout.');
                  // TODO: Integrate actual Apple Pay
                }}
                className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-lg">Pay with Apple Pay</span>
              </button>

              {/* Google Pay Button */}
              <button
                type="button"
                onClick={() => {
                  alert('Google Pay integration would open here. You would be redirected to Google Pay checkout.');
                  // TODO: Integrate actual Google Pay
                }}
                className="w-full bg-white border-2 border-neutral-300 text-neutral-900 py-4 px-6 rounded-xl font-semibold hover:bg-neutral-50 transition-all hover:shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
                  <path d="M24 9.5C19.26 9.5 15.06 11.69 12.22 15.22L15.05 17.77C17.3 15.08 20.4 13.4 24 13.4C27.59 13.4 30.69 15.08 32.94 17.77L35.77 15.22C32.93 11.69 28.73 9.5 24 9.5Z" fill="#EA4335"/>
                  <path d="M32.94 17.77C30.69 15.08 27.59 13.4 24 13.4V20.55L29.4 25.95C31.73 23.62 33.15 20.45 33.15 17C33.15 16.2 33.08 15.46 32.94 17.77Z" fill="#FBBC04"/>
                  <path d="M24 38.45C28.73 38.45 32.93 36.31 35.77 32.78L32.94 30.23C30.69 32.92 27.59 34.55 24 34.55V38.45Z" fill="#34A853"/>
                  <path d="M24 34.55C20.4 34.55 17.3 32.92 15.05 30.23L12.22 32.78C15.06 36.31 19.26 38.45 24 38.45V34.55Z" fill="#4285F4"/>
                </svg>
                <span className="text-lg">Pay with Google Pay</span>
              </button>

              {/* PayPal Button */}
              <button
                type="button"
                onClick={() => {
                  alert('PayPal integration would open here. You would be redirected to PayPal checkout.');
                  // TODO: Integrate actual PayPal
                }}
                className="w-full bg-[#0070BA] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#005EA6] transition-all hover:shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-1.24 7.864a.368.368 0 0 0 .363.426h3.333c.323 0 .598-.235.65-.556l.027-.142 1.019-6.451.065-.352a.65.65 0 0 1 .64-.556h.404c3.957 0 7.05-1.608 7.953-6.248.378-1.943.182-3.564-.793-4.707a3.9 3.9 0 0 0-1.197-.998z"/>
                </svg>
                <span className="text-lg">Pay with PayPal</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
        disabled={isLoading}
        className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all ${
          isLoading
            ? 'bg-neutral-400 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark hover:shadow-xl hover:scale-[1.02]'
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
        <span>Secured Payment • SSL Encrypted</span>
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
  userCountry = 'RS',
  onSuccess,
  onError,
  discountPercent = 0,
}) => {
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
    } else {
      // Reset state when modal closes
      setShowSuccess(false);
    }
  }, [isOpen, userRole, finalPrice, userCountry]);

  const handleSuccess = (paymentIntentId: string) => {
    setShowSuccess(true);
    setTimeout(() => {
      onSuccess(paymentIntentId);
      onClose();
    }, 2000);
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
        <MockPaymentForm
          planName={planName}
          planPrice={finalPrice}
          planInterval={planInterval}
          onSuccess={handleSuccess}
          onError={onError}
          onProcessing={setIsProcessing}
        />

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
