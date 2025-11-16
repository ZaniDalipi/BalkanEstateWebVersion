import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, StarIcon, ArrowLeftIcon, UserCircleIcon, BellIcon } from '../constants';
import PropertyCard from './BuyerFlow/PropertyCard';
import PropertyCardSkeleton from './BuyerFlow/PropertyCardSkeleton';
import AgencyJoinRequestsModal from './AgencyJoinRequestsModal';
import { formatPrice } from '../utils/currency';
import { createJoinRequest } from '../services/apiService';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  rating: number;
  totalSalesValue: number;
  propertiesSold: number;
  activeListings: number;
}

interface Agency {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  address?: string;
  totalProperties: number;
  totalAgents: number;
  yearsInBusiness?: number;
  isFeatured: boolean;
  agents?: Agent[];
}

interface AgencyDetailPageProps {
  agency: Agency;
}

const AgencyDetailPage: React.FC<AgencyDetailPageProps> = ({ agency }) => {
  const { state, dispatch } = useAppContext();
  const { properties, isLoadingProperties, currentUser, isAuthenticated } = state;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoinRequestsModalOpen, setIsJoinRequestsModalOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  // Check if current user owns this agency (need to add ownerId to Agency interface)
  const isOwner = currentUser && (agency as any).ownerId === currentUser.id;

  // Check if current user is an agent not in any agency
  const canRequestToJoin =
    isAuthenticated &&
    currentUser?.role === 'agent' &&
    !currentUser?.agencyId;

  useEffect(() => {
    fetchAgencyData();
  }, [agency._id]);

  const fetchAgencyData = async () => {
    setLoading(true);
    try {
      // TODO: Fetch actual agents from API
      // For now, using mock data from agency
      setAgents(agency.agents || []);
    } catch (error) {
      console.error('Failed to fetch agency data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter properties belonging to agents in this agency
  const agencyProperties = properties.filter(p =>
    agents.some(agent => agent.id === p.sellerId) && p.status === 'active'
  );

  const handleBack = () => {
    dispatch({ type: 'SET_SELECTED_AGENCY', payload: null });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencies' });

    // Reset URL to agencies list
    window.history.pushState({}, '', '/');
  };

  const handleAgentClick = (agentId: string) => {
    dispatch({ type: 'SET_SELECTED_AGENT', payload: agentId });
  };

  const handleRequestToJoin = async () => {
    if (!canRequestToJoin) return;

    setIsRequesting(true);
    try {
      await createJoinRequest(agency._id, 'I would like to join your agency');
      alert('Join request sent successfully! The agency owner will review your request.');
    } catch (error: any) {
      alert(error.message || 'Failed to send join request');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-full animate-fade-in">
      {/* Header with Back Button */}
      <div className="p-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-primary font-semibold hover:underline max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Agencies
        </button>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Agency Header */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-neutral-200 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Logo */}
            {agency.logo ? (
              <img
                src={agency.logo}
                alt={agency.name}
                className="w-32 h-32 rounded-full border-4 border-primary-light object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <BuildingOfficeIcon className="w-16 h-16 text-white" />
              </div>
            )}

            {/* Agency Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900">{agency.name}</h1>
                {agency.isFeatured && (
                  <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                    <StarIcon className="w-5 h-5" />
                    <span>Featured</span>
                  </div>
                )}
              </div>

              {agency.description && (
                <p className="text-neutral-600 mb-4 max-w-2xl">{agency.description}</p>
              )}

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-neutral-600 mb-4">
                <a href={`tel:${agency.phone}`} className="flex items-center gap-2 hover:text-primary">
                  <PhoneIcon className="w-5 h-5" />
                  {agency.phone}
                </a>
                <a href={`mailto:${agency.email}`} className="flex items-center gap-2 hover:text-primary">
                  <EnvelopeIcon className="w-5 h-5" />
                  {agency.email}
                </a>
                {agency.city && agency.country && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    {agency.city}, {agency.country}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-primary">{agency.totalProperties}</div>
                  <div className="text-sm text-neutral-500">Active Properties</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-primary">{agency.totalAgents}</div>
                  <div className="text-sm text-neutral-500">Agents</div>
                </div>
                {agency.yearsInBusiness && (
                  <div className="text-center md:text-left">
                    <div className="text-2xl font-bold text-primary">{agency.yearsInBusiness}</div>
                    <div className="text-sm text-neutral-500">Years in Business</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                {isOwner && (
                  <button
                    onClick={() => setIsJoinRequestsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-md"
                  >
                    <BellIcon className="w-5 h-5" />
                    Manage Join Requests
                  </button>
                )}

                {canRequestToJoin && (
                  <button
                    onClick={handleRequestToJoin}
                    disabled={isRequesting}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
                  >
                    {isRequesting ? 'Sending...' : 'Request to Join Agency'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agents Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our Agents</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : agents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => handleAgentClick(agent.id)}
                  className="bg-white p-4 rounded-lg shadow-md border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {agent.avatarUrl ? (
                      <img
                        src={agent.avatarUrl}
                        alt={agent.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="w-12 h-12 text-neutral-300" />
                    )}
                    <div>
                      <h3 className="font-bold text-neutral-900">{agent.name}</h3>
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-neutral-600">{agent.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-neutral-500">Sales Value</div>
                      <div className="font-bold text-primary">{formatPrice(agent.totalSalesValue, 'Serbia')}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500">Properties Sold</div>
                      <div className="font-bold text-primary">{agent.propertiesSold}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-neutral-200 text-center">
              <p className="text-neutral-500">No agents found for this agency</p>
            </div>
          )}
        </div>

        {/* Properties Section */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Active Listings</h2>
          {isLoadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          ) : agencyProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencyProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-neutral-200 text-center">
              <BuildingOfficeIcon className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-500">No active listings at the moment</p>
            </div>
          )}
        </div>
      </main>

      {/* Join Requests Modal */}
      <AgencyJoinRequestsModal
        isOpen={isJoinRequestsModalOpen}
        onClose={() => setIsJoinRequestsModalOpen(false)}
        agencyId={agency._id}
        agencyName={agency.name}
      />
    </div>
  );
};

export default AgencyDetailPage;
