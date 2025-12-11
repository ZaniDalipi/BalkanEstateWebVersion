import React, { useState, useMemo, useEffect } from 'react';
import { Agent, Property } from '../../types';
import AgencyBadge from '../shared/AgencyBadge';
import { useAppContext } from '../../context/AppContext';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  ChatBubbleBottomCenterTextIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  MapPinIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  HomeIcon,
  TrophyIcon,
  StarIcon,
  UsersIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  CalendarIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  HomeModernIcon
} from '../../constants';
import StarRating from '../shared/StarRating';
import { formatPrice } from '../../utils/currency';
import PropertyCard from '../BuyerFlow/PropertyDisplay/PropertyCard';
import PropertyCardSkeleton from '../BuyerFlow/PropertyDisplay/PropertyCardSkeleton';
import AgentReviewForm from '../shared/AgentReviewForm';
import AgentPerformanceSnapshot from './AgentPerformanceSnapshot';
import { useAgent, useAgentTeam } from '../../src/features/agents/hooks';

interface AgentProfilePageProps {
  agent: Agent;
}

const ProfileAvatar: React.FC<{ agent: Agent; size?: 'sm' | 'md' | 'lg' }> = ({ agent, size = 'lg' }) => {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  if (!agent.avatarUrl || error) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg`}>
        <UserCircleIcon className={`${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-14 h-14' : 'w-20 h-20'} text-gray-300`} />
      </div>
    );
  }

  return (
    <img
      src={agent.avatarUrl}
      alt={agent.name}
      className={`${sizeClasses[size]} rounded-full object-cover border-4 border-white shadow-lg`}
      onError={() => setError(true)}
    />
  );
};

const AgentProfilePage: React.FC<AgentProfilePageProps> = ({ agent: initialAgent }) => {
  const { state, dispatch, createConversation } = useAppContext();
  const { currentUser } = state;
  const [activeTab, setActiveTab] = useState<'overview' | 'for-sale' | 'sold' | 'reviews'>('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [savedAgent, setSavedAgent] = useState(false);

  // Fetch detailed agent data with properties and stats
  const { agent: fetchedAgent, properties, stats, isLoading } = useAgent(initialAgent.id || initialAgent.agentId);

  // Use fetched data or fall back to initial data
  const agent = fetchedAgent || initialAgent;

  const isAgencyAgent = agent.agencyName && agent.agencyName !== 'Independent Agent';
  const agentUserId = agent.userId || agent.id;

  // Fetch team members if agent belongs to an agency
  const { teamMembers } = useAgentTeam(agent.agencyId, { enabled: !!isAgencyAgent && !!agent.agencyId });

  // Filter out the current agent from team members
  const otherTeamMembers = useMemo(() => {
    return teamMembers.filter(member => member.id !== agent.id && member.agentId !== agent.agentId);
  }, [teamMembers, agent.id, agent.agentId]);

  // Get properties from fetched data or state
  const agentProperties = properties?.forSale || state.properties.filter(p => p.sellerId === agentUserId && p.status === 'active');
  const soldProperties = properties?.sold || state.properties.filter(p => p.sellerId === agentUserId && p.status === 'sold');

  const performanceStats = useMemo(() => ({
    propertiesSold: stats?.propertiesSold || agent.propertiesSold || soldProperties.length,
    activeListings: stats?.activeListings || agent.activeListings || agentProperties.length,
    totalSalesValue: stats?.totalSalesValue || agent.totalSalesValue || 0,
    medianPrice: stats?.medianPrice || 0,
    avgDaysOnMarket: stats?.avgDaysOnMarket || 24,
    statsByType: stats?.statsByType,
    rating: agent.rating || 0,
    totalReviews: agent.totalReviews || agent.testimonials?.length || 0,
  }), [agent, stats, soldProperties.length, agentProperties.length]);

  const firstName = agent.name?.split(' ')[0] || 'Agent';
  const canWriteReview = currentUser && currentUser.id !== agentUserId;

  const handleBack = () => {
    dispatch({ type: 'SET_SELECTED_AGENT', payload: null });
    window.history.pushState({}, '', '/agents');
  };

  const handleSaveAgent = () => {
    setSavedAgent(!savedAgent);
  };

  const handleShareAgent = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleContactAgent = async () => {
    if (!state.isAuthenticated) {
      dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
      return;
    }
    try {
      const conversation = await createConversation(agent.id);
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id });
      window.history.pushState({ page: 'inbox' }, '', '/inbox');
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'inbox' });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to contact agent. Please try again.');
    }
  };

  const handleViewAgency = () => {
    if (agent.agencySlug || agent.agencyId) {
      const slug = agent.agencySlug || agent.agencyId;
      window.history.pushState({}, '', `/agencies/${slug}`);
      dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });
    }
  };

  const handleSelectTeamMember = (member: Agent) => {
    dispatch({ type: 'SET_SELECTED_AGENT', payload: member.agentId || member.id });
    window.history.pushState({}, '', `/agents/${member.agentId || member.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Agency Header Bar - Like realestate.com.au */}
      {isAgencyAgent && (
        <div
          className="bg-gradient-to-r from-red-600 to-red-700 text-white cursor-pointer hover:from-red-700 hover:to-red-800 transition-colors"
          onClick={handleViewAgency}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {agent.agencyLogo ? (
                  <img
                    src={agent.agencyLogo}
                    alt={agent.agencyName}
                    className="h-8 w-auto max-w-[120px] object-contain bg-white rounded px-2 py-1"
                  />
                ) : (
                  <BuildingOfficeIcon className="w-6 h-6" />
                )}
                <span className="font-semibold text-lg">{agent.agencyName}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span>View Agency Profile</span>
                <ChevronRightIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Agents</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAgent}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  savedAgent
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-gray-300 hover:border-gray-400 text-gray-600'
                }`}
              >
                <HeartIcon className={`w-5 h-5 ${savedAgent ? 'fill-red-500' : ''}`} />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={handleShareAgent}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-600 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:w-2/3">
            {/* Agent Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0 self-center sm:self-start">
                  <ProfileAvatar agent={agent} size="lg" />
                  {agent.licenseVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5">
                      <CheckBadgeIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{agent.name}</h1>

                  {isAgencyAgent && (
                    <p className="text-gray-600 mb-2">
                      Partner | Sales at <span className="font-medium">{agent.agencyName}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4">
                    {agent.yearsOfExperience && (
                      <span className="text-sm text-gray-600">
                        {agent.yearsOfExperience} years experience
                      </span>
                    )}
                    {(agent.city || agent.country) && (
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4" />
                        {[agent.city, agent.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex items-center gap-2">
                      <StarRating rating={agent.rating || 0} />
                      <span className="text-xl font-bold text-gray-900">
                        {agent.rating ? agent.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <span className="text-gray-500">
                      ({performanceStats.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Contact Bar */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleContactAgent}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                    Enquire
                  </button>
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex-1 sm:flex-none border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <PhoneIcon className="w-5 h-5" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Snapshot */}
            <AgentPerformanceSnapshot
              stats={performanceStats}
              agentName={agent.name}
              className="mb-6"
            />

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'for-sale', label: `For Sale (${agentProperties.length})` },
                  { id: 'sold', label: `Sold (${soldProperties.length})` },
                  { id: 'reviews', label: `Reviews (${performanceStats.totalReviews})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[100px] py-4 px-4 text-center font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* About Section */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">About {firstName}</h2>
                      <div className="prose prose-gray max-w-none">
                        {agent.bio ? (
                          <p className="text-gray-700 leading-relaxed">{agent.bio}</p>
                        ) : (
                          <p className="text-gray-700 leading-relaxed">
                            {firstName} is a dedicated real estate professional
                            {agent.yearsOfExperience && ` with ${agent.yearsOfExperience} years of experience`}
                            {isAgencyAgent && ` as part of the ${agent.agencyName} team`}.
                            Specializing in helping clients achieve their real estate goals through
                            expert market knowledge and personalized service.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Specializations */}
                    {agent.specializations && agent.specializations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Specializations</h3>
                        <div className="flex flex-wrap gap-2">
                          {agent.specializations.map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Service Areas */}
                    {agent.serviceAreas && agent.serviceAreas.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Service Areas</h3>
                        <div className="flex flex-wrap gap-2">
                          {agent.serviceAreas.map((area, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {agent.languages && agent.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Languages</h3>
                        <div className="flex flex-wrap gap-2">
                          {agent.languages.map((lang, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Awards */}
                    {agent.awards && agent.awards.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <TrophyIcon className="w-5 h-5 text-amber-500" />
                          Awards
                        </h3>
                        <ul className="space-y-2">
                          {agent.awards.map((award, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-gray-700">
                              <CheckCircleIcon className="w-4 h-4 text-amber-500" />
                              {award}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'for-sale' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Properties For Sale ({agentProperties.length})
                    </h2>
                    {isLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PropertyCardSkeleton />
                        <PropertyCardSkeleton />
                      </div>
                    ) : agentProperties.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {agentProperties.map((property) => (
                          <PropertyCard key={property.id} property={property} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <HomeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No active listings at the moment</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'sold' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Sold Properties ({soldProperties.length})
                    </h2>
                    {soldProperties.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {soldProperties.map((property) => (
                          <div key={property.id} className="relative">
                            <PropertyCard property={property} />
                            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                              SOLD
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <HomeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No sold properties recorded</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    {/* Reviews Summary */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {agent.rating ? agent.rating.toFixed(1) : '0.0'}
                            <span className="text-xl text-gray-500 ml-1">/ 5.0</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating rating={agent.rating || 0} />
                          </div>
                          <p className="text-sm text-gray-500">
                            {performanceStats.totalReviews} verified reviews
                          </p>
                        </div>

                        {canWriteReview && !showReviewForm && (
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg font-semibold transition-colors"
                          >
                            Write a Review
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && canWriteReview && (
                      <div className="mb-6">
                        <AgentReviewForm
                          agentId={agent.id}
                          agentName={agent.name}
                          onReviewSubmitted={() => {
                            setShowReviewForm(false);
                            window.location.reload();
                          }}
                        />
                      </div>
                    )}

                    {/* Reviews List */}
                    {agent.testimonials && agent.testimonials.length > 0 ? (
                      <div className="space-y-4">
                        {agent.testimonials.map((review, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-xl p-5"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {review.userId?.avatarUrl ? (
                                  <img
                                    src={review.userId.avatarUrl}
                                    alt={review.userId.name || review.clientName}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <UserCircleIcon className="w-8 h-8 text-gray-300" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {review.userId?.name || review.clientName || 'Anonymous'}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <StarRating rating={review.rating || 0} />
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                      <CheckBadgeIcon className="w-3 h-3" />
                                      Verified
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {review.createdAt
                                  ? new Date(review.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                    })
                                  : 'Recently'}
                              </span>
                            </div>
                            <p className="text-gray-700 italic">"{review.quote}"</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <StarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">No reviews yet</p>
                        <p className="text-sm text-gray-400">
                          Be the first to review {firstName}'s services
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact {firstName}</h3>

              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg mb-3 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-semibold text-gray-900">{agent.phone}</div>
                  </div>
                </a>
              )}

              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg mb-4 transition-colors"
                >
                  <EnvelopeIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-semibold text-gray-900 truncate">{agent.email}</div>
                  </div>
                </a>
              )}

              <button
                onClick={handleContactAgent}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Send Message
              </button>
            </div>

            {/* Team Members */}
            {isAgencyAgent && otherTeamMembers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-gray-600" />
                  Team at {agent.agencyName}
                </h3>
                <div className="space-y-3">
                  {otherTeamMembers.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => handleSelectTeamMember(member)}
                    >
                      <ProfileAvatar agent={member} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{member.name}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {member.rating?.toFixed(1) || '-'}
                        </div>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
                {otherTeamMembers.length > 5 && (
                  <button
                    onClick={handleViewAgency}
                    className="w-full mt-3 text-center text-red-600 hover:text-red-700 font-medium text-sm py-2"
                  >
                    View all {otherTeamMembers.length} team members →
                  </button>
                )}
              </div>
            )}

            {/* Credentials */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Credentials</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Licensed Agent</p>
                    <p className="text-sm text-gray-500">
                      License: {agent.licenseNumber || 'Verified'}
                    </p>
                  </div>
                </div>
                {agent.certifications && agent.certifications.length > 0 && (
                  <div className="flex items-start gap-3">
                    <AcademicCapIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Certifications</p>
                      <p className="text-sm text-gray-500">
                        {agent.certifications.join(', ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(agent.websiteUrl || agent.facebookUrl || agent.instagramUrl || agent.linkedinUrl) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Connect</h3>
                <div className="flex gap-3">
                  {agent.websiteUrl && (
                    <a
                      href={agent.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <GlobeAltIcon className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                  {agent.facebookUrl && (
                    <a
                      href={agent.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                      </svg>
                    </a>
                  )}
                  {agent.instagramUrl && (
                    <a
                      href={agent.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-pink-100 hover:bg-pink-200 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                  {agent.linkedinUrl && (
                    <a
                      href={agent.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentProfilePage;
