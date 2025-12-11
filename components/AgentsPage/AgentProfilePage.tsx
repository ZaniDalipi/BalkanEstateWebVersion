import React, { useState, useMemo } from 'react';
import { Agent } from '../../types';
import { Agency } from '../../types';
import AgencyBadge from '../shared/AgencyBadge';
import { useAppContext } from '../../context/AppContext';
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon, 
  ChatBubbleBottomCenterTextIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  UserCircleIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  CheckCircleIcon,
  HomeIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  StarIcon,
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ChevronRightIcon,
  MapIcon,
  CalendarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon,
  FireIcon,
  TrendingUpIcon,
  ArrowTopRightOnSquareIcon,
  UserIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  HomeModernIcon,
  HomePinIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '../../constants';
import StarRating from '../shared/StarRating';
import { formatPrice } from '../../utils/currency';
import PropertyCard from '../BuyerFlow/PropertyDisplay/PropertyCard';
import PropertyCardSkeleton from '../BuyerFlow/PropertyDisplay/PropertyCardSkeleton';
import AgentReviewForm from '../shared/AgentReviewForm';
import { slugify } from '../../utils/slug';


interface AgentProfilePageProps {
  agent: Agent;
}

const ProfileAvatar: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [error, setError] = useState(false);

    if (!agent.avatarUrl || error) {
        return <UserCircleIcon className="w-32 h-32 text-gray-300" />;
    }

    return (
        <img
            src={agent.avatarUrl}
            alt={agent.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            onError={() => setError(true)}
        />
    );
};

const AgentProfilePage: React.FC<AgentProfilePageProps> = ({ agent }) => {
    const { state, dispatch, createConversation } = useAppContext();
    const { isLoadingProperties, currentUser } = state;
    const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'reviews'>('overview');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [savedAgent, setSavedAgent] = useState(false);

    const isAgencyAgent = agent.agencyName && agent.agencyName !== 'Independent Agent';
    const agentUserId = agent.userId || agent.id;
    const agentProperties = state.properties.filter(p => p.sellerId === agentUserId);
    const activeListings = agentProperties.filter(p => p.status === 'active');
    const soldProperties = agentProperties.filter(p => p.status === 'sold');

    const stats = useMemo(() => ({
        totalSales: agent.propertiesSold || 0,
        recentSales: Array.isArray(agent.recentsales) ? agent.recentsales.length : (agent.recentsales || Math.floor((agent.propertiesSold || 0) * 0.3)),
        avgPrice: agent.averageprice || 0,
        teamMembers: agent.teamSize || (isAgencyAgent ? 11 : 1),
        rating: agent.rating || 0,
        reviews: agent.totalReviews || (agent.testimonials?.length || 0),
        yearsExperience: agent.yearsOfExperience || 0,
        minPrice: agent.minPrice || 44000,
        maxPrice: agent.maxPrice || 3800000,
    }), [agent, isAgencyAgent]);

    const firstName = agent.name?.split(' ')[0] || 'Agent';
    const canWriteReview = currentUser && currentUser.id !== agentUserId;

    const handleBack = () => {
        dispatch({ type: 'SET_SELECTED_AGENT', payload: null });
    };

    const handleSaveAgent = () => {
        setSavedAgent(!savedAgent);
        // TODO: Implement save agent functionality
    };

    const handleShareAgent = () => {
        // TODO: Implement share functionality
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


    const handleRequestAppraisal = () => {
        if (!state.isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
            return;
        }
        // TODO: Implement appraisal request form
        alert(`Request appraisal from ${firstName}`);
    };

    const handleScheduleConsultation = () => {
        if (!state.isAuthenticated) {
            dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
            return;
        }
        // TODO: Implement consultation scheduling
        alert(`Schedule consultation with ${firstName}`);
    };

    const handleRequestMarketReport = () => {
        // TODO: Implement market report request
        alert(`Request market report for ${agent.city || 'this area'}`);
    };

    const handleSearchAllProperties = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
        window.history.pushState({}, '', '/search');
    };

    const handleViewMoreAgents = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agents' });
        window.history.pushState({}, '', '/agents');
    };

    // Get similar agents from the same agency or same city
    const similarAgents = useMemo(() => {
        // If agent has an agency, fetch agents from the same agency
        if (agent.agencyName && agent.agencyName !== 'Independent Agent') {
            // In a real app, this would be fetched from the backend
            // For now, we could filter from state if available
            
            return [];
        }
        // Otherwise, show agents from the same city
        return [];
    }, [agent.agencyName, agent.city]);

    // Get header gradient - use agency's gradient or default blue
    const headerGradient = isAgencyAgent && agent.agencyGradient
        ? agent.agencyGradient
        : 'bg-gradient-to-r from-blue-600 to-indigo-700';

    return (
        <div className="min-h-screen bg-gray-50">
  {/* Enhanced Header with Gradient - uses agency's color when available */}
  <div className={`${headerGradient} text-white sticky top-0 z-40 shadow-lg`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4 relative">
        {/* Left section - Back button */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-blue-100 font-semibold transition-colors group flex-shrink-0"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
</div>

{isAgencyAgent && (
  <div className="flex items-center gap-2 text-white-600 mb-3">
    <AgencyBadge
      agencyName={agent.agencyName}
      agencyLogo={agent.agencyLogo}
      type={agent.agencyType as any || 'luxury'} 
      variant="minimal"
      size="lg"
      className="bg-transparent px-0 py-0 border-0"
      showText={false}
    />
    <span className="font-medium">{agent.agencyName}</span>
    {agent.role && <span className="text-white-500">• {agent.agencySlug}</span>}
  </div>
)}

        {/* Right section - Save/Share buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSaveAgent}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <HeartIcon className={`w-5 h-5 ${savedAgent ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={handleShareAgent}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
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
                        {/* Top Profile Card with Enhanced Design */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Avatar Section */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <ProfileAvatar agent={agent} />
                                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full">
                                                <CheckBadgeIcon className="w-6 h-6" />
                                            </div>
                                        </div>
                                        
                                        {/* Quick Stats under Avatar */}
                                        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                                            <div className="bg-blue-50 rounded-lg p-2">
                                                <div className="text-lg font-bold text-blue-700">{stats.totalSales}</div>
                                                <div className="text-xs text-gray-600">Sales</div>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-2">
                                                <div className="text-lg font-bold text-green-700">{stats.yearsExperience}</div>
                                                <div className="text-xs text-gray-600">Years</div>
                                            </div>
                                            <div className="bg-purple-50 rounded-lg p-2">
                                                <div className="text-lg font-bold text-purple-700">{activeListings.length}</div>
                                                <div className="text-xs text-gray-600">Active</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isAgencyAgent ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {isAgencyAgent ? 'TEAM' : 'INDEPENDENT'}
                                                    </span>
                                                </div>
                                                
                                                {isAgencyAgent && (
                                                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                                                        <BuildingOfficeIcon className="w-4 h-4" />
                                                        <span className="font-medium">{agent.agencyName}</span>
                                                        {agent.role && <span className="text-gray-500">• {agent.role}</span>}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <StarRating rating={agent.rating || 0} />
                                                        <span className="text-xl font-bold text-gray-900">
                                                            {agent.rating ? agent.rating.toFixed(1) : '0.0'}
                                                        </span>
                                                        <span className="text-gray-600">
                                                            ({stats.reviews} reviews)
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <FireIcon className="w-5 h-5" />
                                                        <span className="font-semibold">Top Agent</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Contact Bar */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    {agent.phone && (
                                                        <a 
                                                            href={`tel:${agent.phone}`}
                                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                                                        >
                                                            <PhoneIcon className="w-5 h-5" />
                                                            <span>{agent.phone}</span>
                                                        </a>
                                                    )}
                                                    {agent.email && (
                                                        <a 
                                                            href={`mailto:${agent.email}`}
                                                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                                                        >
                                                            <EnvelopeIcon className="w-5 h-5" />
                                                            <span>Email</span>
                                                        </a>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleContactAgent}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
                                                >
                                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                                    Contact Agent
                                                </button>
                                            </div>
                                        </div>

                                        {/* Service Areas & Languages */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {agent.serviceAreas && agent.serviceAreas.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                        <MapPinIcon className="w-4 h-4" />
                                                        Service Areas
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {agent.serviceAreas.slice(0, 3).map(area => (
                                                            <span key={area} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                                                {area}
                                                            </span>
                                                        ))}
                                                        {agent.serviceAreas.length > 3 && (
                                                            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                                                +{agent.serviceAreas.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {agent.languages && agent.languages.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                        Languages
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {agent.languages.map(lang => (
                                                            <span key={lang} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                                                {lang}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation - Enhanced */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex-1 py-5 px-6 text-center font-semibold transition-colors ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <UserIcon className="w-5 h-5" />
                                        Overview
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('listings')}
                                    className={`flex-1 py-5 px-6 text-center font-semibold transition-colors ${activeTab === 'listings' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <HomeIcon className="w-5 h-5" />
                                        Listings ({activeListings.length})
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`flex-1 py-5 px-6 text-center font-semibold transition-colors ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <StarIcon className="w-5 h-5" />
                                        Reviews ({stats.reviews})
                                    </div>
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-8">
                                {activeTab === 'overview' && (
                                    <div className="space-y-8">
                                        {/* About Section */}
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                                                About {firstName}
                                            </h2>
                                            <div className="prose prose-lg text-gray-700 leading-relaxed">
                                                {agent.bio || (
                                                    <p className="text-lg">
                                                        {firstName} is a dedicated real estate professional with {stats.yearsExperience} years of experience
                                                        in the industry{isAgencyAgent && ` as part of the ${agent.agencyName} team`}. 
                                                        {firstName} specializes in helping clients achieve their real estate goals through 
                                                        expert market knowledge and personalized service.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Performance Stats */}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <TrendingUpIcon className="w-6 h-6 text-blue-600" />
                                                Performance & Statistics
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                                    <div className="text-2xl font-bold text-blue-700">{stats.totalSales}</div>
                                                    <div className="text-xs font-semibold text-blue-800">Sold</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                                    <div className="text-2xl font-bold text-green-700">{activeListings.length}</div>
                                                    <div className="text-xs font-semibold text-green-800">Active</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                                    <div className="text-2xl font-bold text-purple-700">{stats.rating.toFixed(1)}</div>
                                                    <div className="text-xs font-semibold text-purple-800">Rating</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                                    <div className="text-2xl font-bold text-orange-700">{stats.yearsExperience}+</div>
                                                    <div className="text-xs font-semibold text-orange-800">Years</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                                                    <div className="text-2xl font-bold text-red-700">{stats.reviews}</div>
                                                    <div className="text-xs font-semibold text-red-800">Reviews</div>
                                                </div>
                                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                                                    <div className="text-2xl font-bold text-indigo-700">{stats.teamMembers}</div>
                                                    <div className="text-xs font-semibold text-indigo-800">Team</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specializations Grid */}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-6">Areas of Expertise</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {agent.specializations && agent.specializations.length > 0 ? (
                                                    agent.specializations.map((spec) => (
                                                        <div key={spec} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors group hover:shadow-md">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                                    {spec.includes('Luxury') ? <TrophyIcon className="w-5 h-5 text-blue-600" /> :
                                                                     spec.includes('Commercial') ? <BuildingLibraryIcon className="w-5 h-5 text-blue-600" /> :
                                                                     spec.includes('Investment') ? <BanknotesIcon className="w-5 h-5 text-blue-600" /> :
                                                                     <HomeModernIcon className="w-5 h-5 text-blue-600" />}
                                                                </div>
                                                                <span className="font-semibold text-gray-800">{spec}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <>
                                                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                                    <HomeModernIcon className="w-5 h-5 text-blue-600" />
                                                                </div>
                                                                <span className="font-semibold text-gray-800">Residential Properties</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-green-100 rounded-lg">
                                                                    <UserIcon className="w-5 h-5 text-green-600" />
                                                                </div>
                                                                <span className="font-semibold text-gray-800">First Time Homebuyers</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                                    <BuildingLibraryIcon className="w-5 h-5 text-purple-600" />
                                                                </div>
                                                                <span className="font-semibold text-gray-800">Property Management</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'listings' && (
                                    <div className="space-y-8">
                                        {/* Listings Header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                                    {firstName}'s Properties
                                                </h2>
                                                <p className="text-gray-600">
                                                    {activeListings.length} active listings • {soldProperties.length} sold properties
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleSearchAllProperties}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                                            >
                                                <MagnifyingGlassIcon className="w-5 h-5" />
                                                Search all properties
                                            </button>
                                        </div>

                                        {/* Active Listings */}
                                        {activeListings.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Listings</h3>
                                                {isLoadingProperties ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        <PropertyCardSkeleton />
                                                        <PropertyCardSkeleton />
                                                        <PropertyCardSkeleton />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {activeListings.map(prop => (
                                                            <PropertyCard key={prop.id} property={prop} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    
                                        {soldProperties.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sold Properties ({soldProperties.length})</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {soldProperties.map(prop => (
                                                        <div key={prop.id} className="relative">
                                                            <PropertyCard property={prop} />
                                                            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg z-10">
                                                                SOLD
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-8">
                                        {/* Reviews Header */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="text-center md:text-left">
                                                    <div className="text-5xl font-bold text-gray-900 mb-2">
                                                        {agent.rating ? agent.rating.toFixed(1) : '0.0'}
                                                        <span className="text-2xl text-gray-600 ml-2">/ 5.0</span>
                                                    </div>
                                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                                        <StarRating rating={agent.rating || 0} />
                                                        <span className="text-gray-600">({stats.reviews} verified reviews)</span>
                                                    </div>
                                                    <p className="text-gray-700">
                                                        {firstName} is rated as a {agent.rating && agent.rating >= 4.5 ? 'Top Performer' : 'Reliable'} Agent
                                                    </p>
                                                </div>
                                                
                                                {canWriteReview && !showReviewForm && (
                                                    <button
                                                        onClick={() => setShowReviewForm(true)}
                                                        className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md"
                                                    >
                                                        Write a Review
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Review Form */}
                                        {showReviewForm && canWriteReview && (
                                            <div className="mb-8">
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
                                            <div className="space-y-6">
                                                {agent.testimonials.slice(0, 5).map((t, index) => (
                                                    <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                {t.userId?.avatarUrl ? (
                                                                    <img
                                                                        src={t.userId.avatarUrl}
                                                                        alt={t.userId.name || t.clientName}
                                                                        className="w-12 h-12 rounded-full"
                                                                    />
                                                                ) : (
                                                                    <UserCircleIcon className="w-12 h-12 text-gray-300" />
                                                                )}
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{t.userId?.name || t.clientName || 'Anonymous'}</p>
                                                                    <p className="text-sm text-gray-600">Verified Buyer • {t.rating}.0</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-gray-500 text-sm">
                                                                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    }) : 'Recently'}
                                                                </div>
                                                                <StarRating rating={t.rating || 0} />
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700 text-lg italic mb-4">"{t.quote}"</p>
                                                        {(t as any).response && (
                                                            <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                                                                <div className="flex items-start gap-3">
                                                                    <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900 mb-1">Response from {firstName}</p>
                                                                        <p className="text-gray-700">{(t as any).response}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-600 text-lg mb-2">No reviews yet</p>
                                                <p className="text-gray-500">Be the first to review {firstName}'s services</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar (Similar to realestate.com.au) */}
                    <div className="lg:w-1/3">
                        {/* Contact Agent Card */}
                        <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 mb-6 text-white">
                            <h3 className="text-xl font-bold mb-4">Contact {firstName}</h3>
                            
                            {agent.phone && (
                                <a 
                                    href={`tel:${agent.phone}`}
                                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-4 rounded-xl mb-3 transition-colors"
                                >
                                    <PhoneIcon className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Call Direct</div>
                                        <div className="text-lg font-bold">{agent.phone}</div>
                                    </div>
                                </a>
                            )}
                            
                            {agent.email && (
                                <a 
                                    href={`mailto:${agent.email}`}
                                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-4 rounded-xl mb-3 transition-colors"
                                >
                                    <EnvelopeIcon className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Send Email</div>
                                        <div className="text-sm truncate">{agent.email}</div>
                                    </div>
                                </a>
                            )}
                        </div>

                        {/* Request Appraisal Card */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Get a Free Property Appraisal</h3>
                            <p className="text-gray-600 mb-4">
                                Curious what your property is worth? {firstName} can provide a free, no-obligation market appraisal.
                            </p>
                            <button
                                onClick={handleRequestAppraisal}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                            >
                                Request Appraisal
                            </button>
                            <div className="text-center text-sm text-gray-500 mt-3">
                                <CheckCircleIcon className="w-4 h-4 inline mr-1 text-green-500" />
                                Free • No obligation
                            </div>
                        </div>

                        {/* Similar Agents / Agents from Same Agency */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <UsersIcon className="w-5 h-5 text-blue-600" />
                                {isAgencyAgent ? 'Agents from Same Agency' : 'Other Agents in Area'}
                            </h3>
                            {similarAgents.length > 0 ? (
                                <div className="space-y-4">
                                    {similarAgents.map((similarAgent) => (
                                        <div key={similarAgent.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                            <img
                                                src={similarAgent.avatarUrl}
                                                alt={similarAgent.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{similarAgent.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <StarRating rating={similarAgent.rating} />
                                                    <span className="text-sm text-gray-600">{similarAgent.rating} ({similarAgent.reviews})</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{similarAgent.agencyName}</p>
                                            </div>
                                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-600 font-medium">No similar agents found</p>
                                </div>
                            )}
                            <button
                                onClick={handleViewMoreAgents}
                                className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-semibold text-sm py-2"
                            >
                                View more agents in {agent.city || 'this area'} →
                            </button>
                        </div>

                        {/* Agent Credentials */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Credentials & Certifications</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Licensed Real Estate Agent</p>
                                        <p className="text-sm text-gray-600">{agent.licenseNumber || 'License: 12345678'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AcademicCapIcon className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Professional Certifications</p>
                                        <p className="text-sm text-gray-600">
                                            {agent.certifications?.join(', ') || 'Member of National Association'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <TrophyIcon className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <p className="font-medium text-gray-900">Awards & Recognition</p>
                                        <p className="text-sm text-gray-600">
                                            {agent.awards?.join(', ') || 'No awards listed'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Market Insights */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6 mt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Local Market Insights</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="font-medium text-gray-700">Avg. Days on Market</span>
                                    <span className="font-bold text-purple-600">24 days</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="font-medium text-gray-700">Price Growth (YoY)</span>
                                    <span className="font-bold text-green-600">+5.2%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                                    <span className="font-medium text-gray-700">Market Activity</span>
                                    <span className="font-bold text-blue-600">High</span>
                                </div>
                            </div>
                            <button
                                onClick={handleRequestMarketReport}
                                className="w-full mt-4 text-center text-purple-600 hover:text-purple-700 font-semibold text-sm py-2"
                            >
                                Request Full Market Report →
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to work with {firstName}?</h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                        Contact {firstName} today for expert real estate advice and personalized service.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a 
                            href={`tel:${agent.phone || ''}`}
                            className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-xl transition-colors shadow-lg"
                        >
                            Call Now: {agent.phone || '(Contact for number)'}
                        </a>
                        <button
                            onClick={handleScheduleConsultation}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                        >
                            Schedule Consultation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentProfilePage;