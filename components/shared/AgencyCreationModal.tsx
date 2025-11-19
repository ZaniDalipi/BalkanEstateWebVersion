import React, { useState } from 'react';
import Modal from '../shared/Modal';
import { BuildingOfficeIcon, CheckCircleIcon } from '../../constants';

interface AgencyCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgencyCreated: (agencyId: string) => void;
}

const AgencyCreationModal: React.FC<AgencyCreationModalProps> = ({
  isOpen,
  onClose,
  onAgencyCreated,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Agency name is required');
      return;
    }
    if (!formData.city.trim() || !formData.country.trim()) {
      setError('City and country are required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem('balkan_estate_token');
      if (!token) {
        throw new Error('Please log in to create an agency');
      }

      const response = await fetch('http://localhost:5001/api/agencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create agency');
      }

      // Success - notify parent with agency ID
      onAgencyCreated(data.agency._id || data.agency.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agency');
      setIsCreating(false);
    }
  };

  const inputClasses = "w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm";
  const labelClasses = "block text-sm font-medium text-neutral-700 mb-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="max-w-2xl mx-auto">
        <div className="text-center pb-6 border-b border-neutral-200 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <BuildingOfficeIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Create Your Agency</h2>
          <p className="text-sm text-neutral-600">
            Before activating your Enterprise plan, let's set up your agency profile
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agency Name */}
          <div>
            <label htmlFor="name" className={labelClasses}>
              Agency Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Premier Real Estate"
              className={inputClasses}
              required
              disabled={isCreating}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClasses}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of your agency..."
              rows={3}
              className={inputClasses}
              disabled={isCreating}
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className={labelClasses}>
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., Belgrade"
                className={inputClasses}
                required
                disabled={isCreating}
              />
            </div>
            <div>
              <label htmlFor="country" className={labelClasses}>
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="e.g., Serbia"
                className={inputClasses}
                required
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className={labelClasses}>
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street address"
              className={inputClasses}
              disabled={isCreating}
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelClasses}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@agency.com"
                className={inputClasses}
                required
                disabled={isCreating}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClasses}>
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+381 11 123 4567"
                className={inputClasses}
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className={labelClasses}>
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
              className={inputClasses}
              disabled={isCreating}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">What you'll get:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Dedicated agency page on our platform</li>
                <li>• Display all your agents and properties</li>
                <li>• Featured in rotating homepage ads</li>
                <li>• Full contact information displayed</li>
                <li>• Unique invitation code for agents</li>
              </ul>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 py-3 px-4 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating Agency...</span>
                </>
              ) : (
                <span>Create Agency & Continue to Payment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AgencyCreationModal;
