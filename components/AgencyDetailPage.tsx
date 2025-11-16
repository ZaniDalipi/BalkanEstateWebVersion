import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, StarIcon, ArrowLeftIcon, UserCircleIcon, BellIcon, TrophyIcon, ChartBarIcon, HomeIcon, UsersIcon } from '../constants';
import PropertyCard from './BuyerFlow/PropertyCard';
import PropertyCardSkeleton from './BuyerFlow/PropertyCardSkeleton';
import AgencyJoinRequestsModal from './AgencyJoinRequestsModal';
import { formatPrice } from '../utils/currency';
import { createJoinRequest } from '../services/apiService';

interface Agent {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  rating?: number;
  totalSalesValue?: number;
  propertiesSold?: number;
  activeListings?: number;
  licenseNumber?: string;
}

interface Agency {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  address?: string;
  website?: string;
  totalProperties: number;
  totalAgents: number;
  yearsInBusiness?: number;
  isFeatured: boolean;
  specialties?: string[];
  certifications?: string[];
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

  const isOwner = currentUser && (agency as any).ownerId === currentUser.id;
  const canRequestToJoin = isAuthenticated && currentUser?.role === 'agent' && !currentUser?.agencyId;

  useEffect(() => {
    fetchAgencyData();
  }, [agency._id]);

  const fetchAgencyData = async () => {
    setLoading(true);
    try {
      setAgents(agency.agents || []);
    } catch (error) {
      console.error('Failed to fetch agency data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter properties belonging to agents in this agency
  const agencyProperties = properties.filter(p =>
    agents.some(agent => agent.id === p.sellerId || agent._id === p.sellerId) && p.status === 'active'
  );

  // Sort agents by performance
  const rankedAgents = [...agents].sort((a, b) => {
    const scoreA = (a.totalSalesValue || 0) + (a.propertiesSold || 0) * 10000 + (a.rating || 0) * 5000;
    const scoreB = (b.totalSalesValue || 0) + (b.propertiesSold || 0) * 10000 + (b.rating || 0) * 5000;
    return scoreB - scoreA;
  });

  const handleBack = () => {
    dispatch({ type: 'SET_SELECTED_AGENCY', payload: null });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencies' });
    window.history.pushState({}, '', '/agencies');
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

  const getRankBadge = (index: number) => {
    if (index === 0) return { emoji: '🥇', color: 'from-yellow-400 to-yellow-600', text: 'Top Agent' };
    if (index === 1) return { emoji: '🥈', color: 'from-gray-300 to-gray-500', text: '2nd Place' };
    if (index === 2) return { emoji: '🥉', color: 'from-orange-400 to-orange-600', text: '3rd Place' };
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Hero Banner with Cover Image - Larger for agency branding */}
      <div className="relative h-[32rem] md:h-[36rem] bg-gradient-to-br from-primary to-primary-dark overflow-hidden flex-shrink-0">
        {agency.coverImage ? (
          <>
            <img
              src={agency.coverImage}
              alt={agency.name}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-black/80" />
        )}

        {/* Back Button - positioned to avoid sidebar on desktop */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 md:left-24 flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-lg bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors z-10"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        {/* Agency Logo and Name */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <div className="relative">
            {agency.logo ? (
              <img
                src={agency.logo}
                alt={agency.name}
                className="w-40 h-40 rounded-3xl border-4 border-white shadow-2xl object-cover"
              />
            ) : (
              <div className="w-40 h-40 rounded-3xl border-4 border-white shadow-2xl bg-white flex items-center justify-center">
                <BuildingOfficeIcon className="w-20 h-20 text-primary" />
              </div>
            )}
            {agency.isFeatured && (
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <StarIcon className="w-4 h-4" />
                Featured
              </div>
            )}
          </div>

          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-white text-center drop-shadow-lg">
            {agency.name}
          </h1>

          <div className="mt-4 flex items-center gap-2 text-white/90 text-lg">
            <MapPinIcon className="w-5 h-5" />
            <span>{agency.city}, {agency.country}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Properties</p>
                <p className="text-3xl font-bold text-primary mt-1">{agency.totalProperties}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <HomeIcon className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Agents</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{agency.totalAgents}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <UsersIcon className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Years in Business</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{agency.yearsInBusiness || 'N/A'}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <ChartBarIcon className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <StarIcon className="w-6 h-6 text-amber-500 fill-current" />
                  <p className="text-3xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <TrophyIcon className="w-7 h-7 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About {agency.name}</h2>
          {agency.description && (
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{agency.description}</p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <a href={`tel:${agency.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PhoneIcon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{agency.phone}</span>
                </a>
                <a href={`mailto:${agency.email}`} className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <EnvelopeIcon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{agency.email}</span>
                </a>
                {agency.address && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{agency.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specialties */}
            {agency.specialties && agency.specialties.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {agency.specialties.map((specialty, index) => (
                    <span key={index} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {isOwner && (
              <button
                onClick={() => setIsJoinRequestsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <BellIcon className="w-5 h-5" />
                Manage Join Requests
              </button>
            )}

            {canRequestToJoin && (
              <button
                onClick={handleRequestToJoin}
                disabled={isRequesting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isRequesting ? 'Sending...' : 'Request to Join Agency'}
              </button>
            )}
          </div>
        </div>

        {/* Top Agents Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Top Performing Agents</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrophyIcon className="w-5 h-5" />
              <span>Ranked by Performance</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : rankedAgents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rankedAgents.map((agent, index) => {
                const rank = getRankBadge(index);
                return (
                  <div
                    key={agent.id || agent._id}
                    onClick={() => handleAgentClick(agent.id || agent._id || '')}
                    className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  >
                    {/* Rank Badge */}
                    {rank && (
                      <div className={`absolute -top-3 -right-3 bg-gradient-to-r ${rank.color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2`}>
                        <span className="text-lg">{rank.emoji}</span>
                        <span>{rank.text}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Agent Photo */}
                      <div className="relative">
                        {agent.avatarUrl ? (
                          <img
                            src={agent.avatarUrl}
                            alt={agent.name}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center border-2 border-gray-200">
                            <UserCircleIcon className="w-12 h-12 text-white" />
                          </div>
                        )}
                        {agent.rating && agent.rating >= 4.5 && (
                          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow">
                            <StarIcon className="w-3 h-3 inline fill-current" />
                            {agent.rating.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                        {agent.licenseNumber && (
                          <p className="text-sm text-gray-500">License: {agent.licenseNumber}</p>
                        )}

                        {/* Performance Stats */}
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Sales</p>
                            <p className="text-lg font-bold text-primary">
                              {formatPrice(agent.totalSalesValue || 0, agency.country || 'Serbia')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Properties Sold</p>
                            <p className="text-lg font-bold text-green-600">{agent.propertiesSold || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Active Listings</p>
                            <p className="text-lg font-bold text-blue-600">{agent.activeListings || 0}</p>
                          </div>
                        </div>

                        {/* Contact */}
                        {agent.phone && (
                          <a
                            href={`tel:${agent.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <PhoneIcon className="w-4 h-4" />
                            {agent.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No agents found for this agency</p>
            </div>
          )}
        </div>

        {/* Active Properties Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Active Listings</h2>
            <span className="text-sm text-gray-500">{agencyProperties.length} properties</span>
          </div>

          {isLoadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : agencyProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencyProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
              <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No active listings at the moment</p>
              <p className="text-gray-400 text-sm mt-2">Check back soon for new properties</p>
            </div>
          )}
        </div>
      </div>

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
