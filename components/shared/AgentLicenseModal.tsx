import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AgentLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (licenseData: { licenseNumber: string; agencyName: string; agentId?: string }) => Promise<void>;
}

const AgentLicenseModal: React.FC<AgentLicenseModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!licenseNumber.trim() || !agencyName.trim()) {
      setError('License number and agency name are required');
      return;
    }

    if (licenseNumber.length < 5) {
      setError('License number must be at least 5 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        licenseNumber: licenseNumber.trim(),
        agencyName: agencyName.trim(),
        agentId: agentId.trim() || undefined,
      });

      // Reset form
      setLicenseNumber('');
      setAgencyName('');
      setAgentId('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to verify license. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setLicenseNumber('');
      setAgencyName('');
      setAgentId('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Agent License Verification</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            To become an agent, you need to provide your valid real estate license information. This helps maintain trust and credibility in our platform.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* License Number */}
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="licenseNumber"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., RS-LIC-12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your official real estate license number
              </p>
            </div>

            {/* Agency Name */}
            <div>
              <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-1">
                Agency Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="agencyName"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., Balkan Premier Estates"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The name of your real estate agency
              </p>
            </div>

            {/* Agent ID (Optional) */}
            <div>
              <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 mb-1">
                Agent ID <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="agentId"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., AG-12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your unique agent identifier (will be generated if not provided)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Become Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentLicenseModal;
