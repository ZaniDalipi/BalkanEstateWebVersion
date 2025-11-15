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
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onProcessing: (isProcessing: boolean) => void;
}> = ({ planName, planPrice, onSuccess, onError, onProcessing }) => {
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

    // Simulate payment processing
    setTimeout(() => {
      // Mock success - generate a fake payment ID
      const mockPaymentId = 'mock_pi_' + Math.random().toString(36).substring(2, 15);
      onSuccess(mockPaymentId);
      setIsLoading(false);
      onProcessing(false);
    }, 2000);
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
          <div className="text-center py-8">
            <DevicePhoneMobileIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Digital Wallet</h3>
            <p className="text-sm text-neutral-600 mb-6">
              Pay with Apple Pay, Google Pay, or PayPal
            </p>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                 Pay
              </button>
              <button
                type="button"
                className="w-full bg-white border-2 border-neutral-300 text-neutral-700 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
              >
                G Pay
              </button>
              <button
                type="button"
                className="w-full bg-[#0070BA] text-white py-3 rounded-lg font-semibold hover:bg-[#005EA6] transition-colors"
              >
                PayPal
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
