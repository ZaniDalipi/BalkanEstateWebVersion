import React, { useState } from 'react';
import { User } from '../../types';
import { findAgencyByInvitationCode, createJoinRequest, leaveAgency } from '../../services/apiService';
import { useAppContext } from '../../context/AppContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Agency {
  _id: string;
  name: string;
  description?: string;
  city?: string;
  country?: string;
  slug?: string;
  logo?: string;
  totalAgents?: number;
}

interface AgencyManagementSectionProps {
  currentUser: User;
  onAgencyChange: () => void;
}

const AgencyManagementSection: React.FC<AgencyManagementSectionProps> = ({ currentUser, onAgencyChange }) => {
  const { dispatch } = useAppContext();
  const [invitationCode, setInvitationCode] = useState('');
  const [foundAgency, setFoundAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleFindAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFoundAgency(null);

    // Validation
    if (!invitationCode.trim()) {
      setError('Please enter an invitation code');
      return;
    }

    try {
      setSearching(true);
      console.log('🔍 Looking up agency with code:', invitationCode.trim().toUpperCase());

      const response = await findAgencyByInvitationCode(invitationCode.trim());

      if (response.success && response.agency) {
        console.log('✅ Found agency:', response.agency.name);
        setFoundAgency(response.agency);
      }
    } catch (err: any) {
      console.error('❌ Failed to find agency:', err);
      setError(err.message || 'Invalid invitation code. Please check and try again.');
      setFoundAgency(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSendJoinRequest = async () => {
    if (!foundAgency) return;

    try {
      setLoading(true);
      setError('');
      console.log('📤 Sending join request to agency:', foundAgency.name);

      // Create join request
      await createJoinRequest(foundAgency._id, `Join request with invitation code: ${invitationCode.trim().toUpperCase()}`);
      console.log('✅ Join request sent successfully');

      // Fetch full agency details to navigate to agency page
      const agencyResponse = await fetch(`${API_URL}/agencies/${foundAgency._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
        },
      });

      if (agencyResponse.ok) {
        const agencyData = await agencyResponse.json();

        // Set selected agency in context
        dispatch({ type: 'SET_SELECTED_AGENCY', payload: agencyData.agency });

        // Navigate to agency detail view
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });

        // Show success message
        alert(
          `✅ Join request sent to ${foundAgency.name}!\n\n` +
          `📋 Your request is pending approval from the agency.\n` +
          `🔔 You will be notified when they respond.\n\n` +
          `Navigating to agency page...`
        );

        // Reset form
        setInvitationCode('');
        setFoundAgency(null);
        setShowForm(false);
      } else {
        // Request sent but couldn't fetch agency details
        alert(
          `✅ Join request sent to ${foundAgency.name}!\n\n` +
          `📋 Your request is pending approval.\n` +
          `🔔 You will be notified when they respond.`
        );

        setInvitationCode('');
        setFoundAgency(null);
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
    setInvitationCode('');
    setFoundAgency(null);
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

          {/* Step 1: Enter Invitation Code */}
          <form onSubmit={handleFindAgency} className="space-y-4">
            <div>
              <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700 mb-2">
                Agency Invitation Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="invitation-code"
                value={invitationCode}
                onChange={(e) => {
                  setInvitationCode(e.target.value.toUpperCase());
                  setError('');
                  setFoundAgency(null);
                }}
                disabled={searching || loading}
                placeholder="e.g., AGY-BELGRAD-A1B2C3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Enter the invitation code provided by the agency
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Agency Preview */}
            {foundAgency && (
              <div className="p-4 bg-white border-2 border-green-200 rounded-lg">
                <div className="flex items-start gap-4">
                  {foundAgency.logo ? (
                    <img
                      src={foundAgency.logo}
                      alt={foundAgency.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900 text-lg">{foundAgency.name}</h5>
                    {foundAgency.city && foundAgency.country && (
                      <p className="text-sm text-gray-600">
                        📍 {foundAgency.city}, {foundAgency.country}
                      </p>
                    )}
                    {foundAgency.totalAgents !== undefined && (
                      <p className="text-sm text-gray-600 mt-1">
                        👥 {foundAgency.totalAgents} agents
                      </p>
                    )}
                    {foundAgency.description && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {foundAgency.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={searching || loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>

              {!foundAgency ? (
                <button
                  type="submit"
                  disabled={searching || !invitationCode.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {searching ? 'Searching...' : 'Find Agency'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendJoinRequest}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Sending Request...' : 'Send Join Request'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AgencyManagementSection;
