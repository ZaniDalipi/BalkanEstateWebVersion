import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getAgencies, createJoinRequest, leaveAgency } from '../../services/apiService';
import { useAppContext } from '../../context/AppContext';
import { API_URL } from '../../constants';

interface Agency {
  _id: string;
  name: string;
  city?: string;
  country?: string;
  slug?: string;
}

interface AgencyManagementSectionProps {
  currentUser: User;
  onAgencyChange: () => void;
}

const AgencyManagementSection: React.FC<AgencyManagementSectionProps> = ({ currentUser, onAgencyChange }) => {
  const { dispatch } = useAppContext();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAgencies, setLoadingAgencies] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Fetch agencies when form is shown
  useEffect(() => {
    if (showForm && agencies.length === 0) {
      fetchAgencies();
    }
  }, [showForm]);

  const fetchAgencies = async () => {
    try {
      setLoadingAgencies(true);
      const response = await getAgencies({ limit: 100 });
      setAgencies(response.agencies || []);
      console.log('✅ Loaded', response.agencies?.length || 0, 'agencies');
    } catch (err) {
      console.error('❌ Failed to load agencies:', err);
      setError('Failed to load agencies. Please try again.');
    } finally {
      setLoadingAgencies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!selectedAgencyId) {
      setError('Please select an agency');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Sending join request to agency:', selectedAgencyId);

      // Create join request with optional invitation code as message
      const message = invitationCode.trim()
        ? `Join request with invitation code: ${invitationCode.trim().toUpperCase()}`
        : 'Join request from profile';

      const joinRequestResponse = await createJoinRequest(selectedAgencyId, message);
      console.log('✅ Join request sent successfully');

      // Fetch agency details to navigate to agency page
      const agencyResponse = await fetch(`${API_URL}/agencies/${selectedAgencyId}`);
      if (agencyResponse.ok) {
        const agencyData = await agencyResponse.json();

        // Set selected agency in context
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: agencyData.agency });

        // Navigate to agency detail view
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });

        // Show success message
        alert(
          `✅ Join request sent to ${agencyData.agency.name}!\n\n` +
          `📋 Your request is pending approval from the agency.\n` +
          `🔔 You will be notified when they respond.\n\n` +
          `Navigating to agency page...`
        );

        // Reset form
        setSelectedAgencyId('');
        setInvitationCode('');
        setShowForm(false);
      } else {
        // Request sent but couldn't fetch agency details
        alert(
          `✅ Join request sent successfully!\n\n` +
          `📋 Your request is pending approval from the agency.\n` +
          `🔔 You will be notified when they respond.`
        );

        setSelectedAgencyId('');
        setInvitationCode('');
        setShowForm(false);
      }

    } catch (err: any) {
      console.error('❌ Failed to send join request:', err);
      setError(err.message || 'Failed to send join request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedAgencyId('');
    setInvitationCode('');
    setError('');
  };

  const handleLeaveAgency = async () => {
    if (!confirm(`Are you sure you want to leave ${currentUser.agencyName}? You will become an Independent Agent.`)) {
      return;
    }

    try {
      setLoading(true);

      const data = await leaveAgency();

      console.log('✅ Successfully left agency');

      // Update user context immediately
      dispatch({
        type: 'UPDATE_USER',
        payload: {
          agencyName: 'Independent Agent',
          agencyId: null,
        }
      });

      alert(
        `✅ You have successfully left the agency.\n\n` +
        `You are now an Independent Agent.`
      );

      // Trigger refresh callback
      onAgencyChange();

    } catch (err: any) {
      console.error('❌ Failed to leave agency:', err);
      setError(err.message || 'Failed to leave agency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentAgencyInfo = currentUser.agencyName && currentUser.agencyName !== 'Independent Agent'
    ? currentUser.agencyName
    : 'Independent Agent';

  const isIndependent = !currentUser.agencyName || currentUser.agencyName === 'Independent Agent';

  return (
    <div className="space-y-4">
      {/* Current Agency Status */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Current Agency</h4>
            <p className="text-lg font-bold text-blue-600 mt-1">{currentAgencyInfo}</p>
          </div>
          {!showForm && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isIndependent ? 'Join an Agency' : 'Switch Agency'}
              </button>
              {!isIndependent && (
                <button
                  type="button"
                  onClick={handleLeaveAgency}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Leave Agency
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agency Join/Switch Form */}
      {showForm && (
        <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg animate-fade-in">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">
            {isIndependent ? 'Join an Agency' : 'Switch to a Different Agency'}
          </h4>

          {!isIndependent && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ You are currently with <strong>{currentUser.agencyName}</strong>.
                Switching will remove you from your current agency.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Agency Selection */}
            <div>
              <label htmlFor="agency-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Agency <span className="text-red-500">*</span>
              </label>
              {loadingAgencies ? (
                <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500 text-sm">
                  Loading agencies...
                </div>
              ) : (
                <select
                  id="agency-select"
                  value={selectedAgencyId}
                  onChange={(e) => {
                    setSelectedAgencyId(e.target.value);
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  required
                >
                  <option value="">-- Choose an agency --</option>
                  {agencies.map((agency) => (
                    <option key={agency._id} value={agency._id}>
                      {agency.name} {agency.city ? `(${agency.city}${agency.country ? ', ' + agency.country : ''})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Invitation Code (Optional) */}
            <div>
              <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700 mb-2">
                Agency Invitation Code <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                id="invitation-code"
                value={invitationCode}
                onChange={(e) => {
                  setInvitationCode(e.target.value.toUpperCase());
                  setError('');
                }}
                disabled={loading}
                placeholder="e.g., AGY-BELGRAD-A1B2C3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
              />
              <p className="text-xs text-gray-600 mt-1">
                Optional: Include an invitation code if you have one from the agency
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedAgencyId}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Sending Request...' : 'Send Join Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AgencyManagementSection;
