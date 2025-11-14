import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AgentLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (licenseData: { licenseNumber: string; agencyName: string; agentId?: string; licenseDocument?: File }) => Promise<void>;
}

const AgentLicenseModal: React.FC<AgentLicenseModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate that a document is uploaded
    if (!licenseDocument) {
      setError('Please upload a license document (image or PDF) to verify your license.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit({
        licenseNumber: licenseNumber.trim(),
        agencyName: agencyName.trim(),
        agentId: agentId.trim() || undefined,
        licenseDocument: licenseDocument,
      });

      // Only reset form and close on success
      setLicenseNumber('');
      setAgencyName('');
      setAgentId('');
      setLicenseDocument(null);
      setError('');
      onClose();
    } catch (err: any) {
      // Keep form open with user data on error
      setError(err.message || 'Failed to verify license. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setLicenseNumber('');
      setAgencyName('');
      setAgentId('');
      setLicenseDocument(null);
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
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
            To become a verified agent, you need to provide your valid real estate license information and upload a document. This helps maintain trust and credibility in our platform.
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

            {/* License Document (Required) */}
            <div>
              <label htmlFor="licenseDocument" className="block text-sm font-medium text-gray-700 mb-1">
                License Document <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="licenseDocument"
                accept="image/*,.pdf"
                onChange={(e) => setLicenseDocument(e.target.files?.[0] || null)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a photo or PDF of your real estate license (Max 10MB)
              </p>
              {licenseDocument && (
                <p className="text-xs text-green-600 mt-1 font-medium">
                  ✓ {licenseDocument.name} ({(licenseDocument.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
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
