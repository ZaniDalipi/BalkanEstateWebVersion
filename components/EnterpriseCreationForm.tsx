import React, { useState } from 'react';
import Modal from './shared/Modal';
import PaymentWindow from './shared/PaymentWindow';
import { BuildingOfficeIcon, PhotoIcon } from '../constants';
import { createAgency } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

interface EnterpriseCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnterpriseCreationForm: React.FC<EnterpriseCreationFormProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useAppContext();
  const [step, setStep] = useState<'form' | 'pricing'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentWindow, setShowPaymentWindow] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: state.currentUser?.email || '',
    phone: state.currentUser?.phone || '',
    address: '',
    city: state.currentUser?.city || '',
    country: state.currentUser?.country || '',
    website: '',
    yearsInBusiness: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    businessHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBusinessHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: { ...prev.businessHours, [day]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields (Name, Email, Phone)');
      return;
    }

    // Check if user is authenticated
    if (!state.isAuthenticated || !state.currentUser) {
      dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true, view: 'login' } });
      return;
    }

    // Show pricing modal for enterprise plan (€1000/year)
    setStep('pricing');
  };

  const handleProceedToPayment = () => {
    // Open payment window directly for Enterprise plan
    setShowPaymentWindow(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setShowPaymentWindow(false);

    try {
      setLoading(true);

      const agencyData = {
        ...formData,
        yearsInBusiness: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : undefined,
      };

      await createAgency(agencyData);
      onClose();
      alert('Congratulations! Your Enterprise Agency has been created successfully. You now have a dedicated agency page with featured advertising.');
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencies' });
    } catch (error) {
      setError('Payment successful but failed to create agency. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentWindow(false);
    setError('Payment failed: ' + error);
  };

  const handleBack = () => {
    if (step === 'pricing') {
      setStep('form');
    } else {
      onClose();
    }
  };

  // Determine user role for payment methods
  const getUserRole = (): 'buyer' | 'private_seller' | 'agent' => {
    if (!state.currentUser) return 'agent'; // Enterprise is typically for agents
    return state.currentUser.role === 'agent' ? 'agent' : 'private_seller';
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="p-6">
        {step === 'form' ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <BuildingOfficeIcon className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-neutral-800">Create Enterprise Agency</h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-neutral-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-neutral-800">Basic Information</h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Agency Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Balkan Premier Estates"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about your agency..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="yearsInBusiness"
                      value={formData.yearsInBusiness}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 10"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-neutral-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-neutral-800">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="agency@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+381 11 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Office Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Belgrade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Serbia"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://www.yourwebsite.com"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-neutral-50 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-neutral-800">Social Media (Optional)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      name="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Pricing Step */}
            <div className="text-center py-8">
              <BuildingOfficeIcon className="w-20 h-20 text-amber-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-neutral-800 mb-4">Enterprise Plan Required</h2>
              <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
                To create an enterprise agency profile with your own dedicated page, featured advertising, and unlimited listings, you need the Enterprise plan.
              </p>

              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white rounded-2xl p-8 max-w-md mx-auto mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <BuildingOfficeIcon className="w-8 h-8 text-amber-400" />
                  <h3 className="text-2xl font-bold">Enterprise Plan</h3>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-extrabold">€1,000</span>
                  <span className="text-xl text-neutral-300">/year</span>
                </div>

                <ul className="space-y-3 text-left mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Dedicated agency page with branding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Display all agents and properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Featured in rotating homepage ads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Unlimited property listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 text-xl">✓</span>
                    <span>Full contact information display</span>
                  </li>
                </ul>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-lg transition-all hover:scale-105"
                >
                  Proceed to Payment
                </button>
              </div>

              <button
                onClick={handleBack}
                className="text-neutral-600 hover:text-neutral-800 font-semibold"
              >
                ← Back to Form
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>

    {/* Payment Window */}
    <PaymentWindow
      isOpen={showPaymentWindow}
      onClose={() => setShowPaymentWindow(false)}
      planName="Enterprise"
      planPrice={1000}
      planInterval="year"
      userRole={getUserRole()}
      userEmail={state.currentUser?.email}
      userCountry={state.currentUser?.country || 'RS'}
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
      discountPercent={0}
    />
    </>
  );
};

export default EnterpriseCreationForm;
