import React, { useState, useMemo } from 'react';
import { Agent } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeftIcon, BuildingOfficeIcon, ChartBarIcon, ChatBubbleBottomCenterTextIcon, EnvelopeIcon, PhoneIcon, UserCircleIcon, MapPinIcon, GlobeAltIcon } from '../../constants';
import StarRating from '../shared/StarRating';
import { formatPrice } from '../../utils/currency';
import PropertyCard from '../BuyerFlow/PropertyDisplay/PropertyCard';
import PropertyCardSkeleton from '../BuyerFlow/PropertyDisplay/PropertyCardSkeleton';
import AgentReviewForm from '../shared/AgentReviewForm';
import { slugify } from '../../utils/slug';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface AgentProfilePageProps {
  agent: Agent;
}

const StatCard: React.FC<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
}> = ({ label, value, icon, onClick, isActive }) => {
    const baseClasses = "p-4 rounded-lg flex items-center gap-4 transition-all";
    const interactiveClasses = onClick ? "cursor-pointer hover:shadow-lg hover:scale-105" : "";
    const bgClasses = isActive ? "bg-primary text-white shadow-lg" : "bg-primary-light";
    const iconBgClasses = isActive ? "bg-white/20" : "bg-white";
    const iconColorClasses = isActive ? "text-white" : "text-primary";
    const textColorClasses = isActive ? "text-white" : "text-primary-dark";
    const labelColorClasses = isActive ? "text-white/90" : "text-primary-dark/80";

    return (
        <div
            className={`${baseClasses} ${interactiveClasses} ${bgClasses}`}
            onClick={onClick}
        >
            <div className={`${iconBgClasses} p-3 rounded-full ${iconColorClasses}`}>
                {icon}
            </div>
            <div>
                <p className={`text-sm font-semibold ${labelColorClasses}`}>{label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${textColorClasses}`}>{value}</p>
            </div>
        </div>
    );
};

// Fix for default Leaflet icon issue with bundlers
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ProfileAvatar: React.FC<{ agent: Agent }> = ({ agent }) => {
    const [error, setError] = useState(false);

    if (!agent.avatarUrl || error) {
        return <UserCircleIcon className="w-32 h-32 text-neutral-300" />;
    }

    return (
        <img
            src={agent.avatarUrl}
            alt={agent.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-primary-light"
            onError={() => setError(true)}
        />
    );
};

// Agent Properties Map Component
const AgentPropertiesMap: React.FC<{ properties: any[] }> = ({ properties }) => {
    const validProperties = useMemo(() => {
        return properties.filter(p => p.lat != null && !isNaN(p.lat) && p.lng != null && !isNaN(p.lng));
    }, [properties]);

    if (validProperties.length === 0) {
        return (
            <div className="h-96 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
                <p>No properties with location data available</p>
            </div>
        );
    }

    // Calculate center point from all properties
    const center: [number, number] = useMemo(() => {
        const avgLat = validProperties.reduce((sum, p) => sum + p.lat, 0) / validProperties.length;
        const avgLng = validProperties.reduce((sum, p) => sum + p.lng, 0) / validProperties.length;
        return [avgLat, avgLng];
    }, [validProperties]);

    return (
        <div className="h-96 rounded-lg overflow-hidden shadow-md">
            <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="w-full h-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validProperties.map((property) => (
                    <Marker key={property.id} position={[property.lat, property.lng]}>
                        <Popup>
                            <div className="text-sm">
                                <p className="font-semibold">{formatPrice(property.price, 'Serbia')}</p>
                                <p className="text-neutral-600">{property.address}</p>
                                <p className="text-neutral-500">{property.beds} beds • {property.baths} baths</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

const AgentProfilePage: React.FC<AgentProfilePageProps> = ({ agent }) => {
    const { state, dispatch } = useAppContext();
    const { isLoadingProperties, currentUser } = state;
    const [propertyView, setPropertyView] = useState<'active' | 'sold'>('active');
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Match against userId since properties are linked to user, not agent document
    const agentUserId = agent.userId || agent.id;

    const agentProperties = state.properties.filter(p => {
        if (p.sellerId !== agentUserId) return false;
        return propertyView === 'active' ? p.status === 'active' : p.status === 'sold';
    });

    // Get all agent properties for the map (both active and sold)
    const allAgentProperties = state.properties.filter(p => p.sellerId === agentUserId);

    // Featured properties - show top 4 active listings
    const featuredProperties = state.properties
        .filter(p => p.sellerId === agentUserId && p.status === 'active')
        .slice(0, 4);

    const handleBack = () => {
        dispatch({ type: 'SET_SELECTED_AGENT', payload: null });
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        // Refresh agent data to show new review
        window.location.reload();
    };

    const handleAgencyClick = async () => {
        // Don't navigate if no agency name
        if (!agent.agencyName || agent.agencyName === 'Independent Agent') {
            return;
        }

        // Use agencyId if available for direct lookup, otherwise fallback to slug
        const agencyIdentifier = agent.agencyId || slugify(agent.agencyName);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
            console.log('🔗 Fetching agency:', agencyIdentifier, 'for agent:', agent.name);

            const response = await fetch(`${API_URL}/agencies/${agencyIdentifier}`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Agency found:', data.agency.name);

                // Pass the full agency object and navigate
                dispatch({ type: 'SET_SELECTED_AGENCY', payload: data.agency });
                dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });

                // Update URL - convert old comma format to new forward slash format
                let urlSlug = data.agency.slug || data.agency._id;
                // Replace comma with forward slash for backward compatibility with old slugs
                urlSlug = urlSlug.replace(',', '/');
                window.history.pushState({}, '', `/agencies/${urlSlug}`);
            } else {
                console.error('❌ Agency not found:', agent.agencyName, 'with identifier:', agencyIdentifier);
                alert(
                    `⚠️ Agency Not Found\n\n` +
                    `The agency "${agent.agencyName}" is referenced in this agent's profile ` +
                    `but doesn't exist in the database.\n\n` +
                    `This agent's data may be outdated or the agency was deleted.\n\n` +
                    `Identifier used: ${agencyIdentifier}`
                );
            }
        } catch (error) {
            console.error('Error fetching agency:', error);
            alert('Failed to load agency details. Please check your connection and try again.');
        }
    };

    // Check if user can write a review (logged in and not viewing own profile)
    const canWriteReview = currentUser && currentUser.id !== agentUserId;

    return (
    <div className="bg-neutral-50 min-h-full animate-fade-in">
       <div className="p-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
            <button onClick={handleBack} className="flex items-center gap-2 text-primary font-semibold hover:underline max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Leaderboard
            </button>
        </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-neutral-200 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Profile Info */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1">
                    <ProfileAvatar agent={agent} />
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">{agent.name}</h1>

                        {agent.agencyName && (
                            <div
                                className="mb-3 inline-flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-full shadow-md cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all"
                                onClick={handleAgencyClick}
                                title="View agency profile"
                            >
                                <BuildingOfficeIcon className="w-5 h-5" />
                                <span className="font-semibold">{agent.agencyName}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            {agent.rating > 0 ? (
                                <>
                                    <StarRating rating={agent.rating} />
                                    <span className="text-lg font-bold text-neutral-700">{agent.rating.toFixed(1)}</span>
                                    {agent.totalReviews && (
                                        <span className="text-sm text-neutral-500">({agent.totalReviews} reviews)</span>
                                    )}
                                </>
                            ) : (
                                <span className="text-sm text-neutral-500 italic">No reviews yet</span>
                            )}
                        </div>

                        <div className="flex items-center justify-center md:justify-start flex-wrap gap-x-6 gap-y-2 text-neutral-600">
                            <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                <PhoneIcon className="w-5 h-5"/>{agent.phone}
                            </a>
                            <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                <EnvelopeIcon className="w-5 h-5"/>{agent.email}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right: Additional Info Card */}
                <div className="bg-primary-light/30 p-6 rounded-lg space-y-3 lg:w-80">
                    {agent.yearsOfExperience && (
                        <div>
                            <p className="text-sm font-semibold text-neutral-600">Experience</p>
                            <p className="text-lg font-bold text-neutral-900">{agent.yearsOfExperience} years</p>
                        </div>
                    )}
                    {agent.languages && agent.languages.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-neutral-600">Languages</p>
                            <p className="text-neutral-900">{agent.languages.join(', ')}</p>
                        </div>
                    )}
                    {agent.specializations && agent.specializations.length > 0 && (
                        <div>
                            <p className="text-sm font-semibold text-neutral-600">Specializations</p>
                            <p className="text-neutral-900">{agent.specializations.join(', ')}</p>
                        </div>
                    )}
                    {agent.officeAddress && (
                        <div>
                            <p className="text-sm font-semibold text-neutral-600">Office Address</p>
                            <p className="text-neutral-900 flex items-start gap-2">
                                <MapPinIcon className="w-4 h-4 mt-1 flex-shrink-0" />
                                <span>{agent.officeAddress}</span>
                            </p>
                        </div>
                    )}
                    {agent.officePhone && (
                        <div>
                            <p className="text-sm font-semibold text-neutral-600">Office Phone</p>
                            <a href={`tel:${agent.officePhone}`} className="text-neutral-900 hover:text-primary flex items-center gap-2">
                                <PhoneIcon className="w-4 h-4" />
                                {agent.officePhone}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard label="Total Sales Value" value={formatPrice(agent.totalSalesValue, 'Serbia')} icon={<ChartBarIcon className="w-6 h-6"/>} />
            <StatCard
                label="Properties Sold"
                value={agent.propertiesSold}
                icon={<BuildingOfficeIcon className="w-6 h-6"/>}
                onClick={() => setPropertyView('sold')}
                isActive={propertyView === 'sold'}
            />
            <StatCard
                label="Active Listings"
                value={agent.activeListings}
                icon={<BuildingOfficeIcon className="w-6 h-6"/>}
                onClick={() => setPropertyView('active')}
                isActive={propertyView === 'active'}
            />
        </div>

        {/* Bio/About Section */}
        {agent.bio && (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-neutral-200 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-4">About {agent.name}</h2>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">{agent.bio}</p>
            </div>
        )}

        {/* Featured Listings */}
        {featuredProperties.length > 0 && (
            <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-4">Featured Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProperties.map(prop => (
                        <PropertyCard key={prop.id} property={prop} />
                    ))}
                </div>
            </div>
        )}

        {/* Properties Map */}
        {allAgentProperties.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-neutral-200 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-4">Property Locations</h2>
                <AgentPropertiesMap properties={allAgentProperties} />
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-4">
                    {propertyView === 'active' ? 'Active Listings' : 'Sold Properties'}
                </h2>
                {isLoadingProperties ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PropertyCardSkeleton />
                        <PropertyCardSkeleton />
                    </div>
                ) : agentProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {agentProperties.map(prop => <PropertyCard key={prop.id} property={prop} />)}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-white rounded-lg border">
                        <p className="text-neutral-600">
                            {propertyView === 'active'
                                ? `${agent.name} has no active listings at the moment.`
                                : `${agent.name} has no sold properties yet.`
                            }
                        </p>
                    </div>
                )}
            </div>
            <div className="space-y-8">
                 {/* Social Media & Website Links */}
                 {(agent.websiteUrl || agent.facebookUrl || agent.instagramUrl || agent.linkedinUrl) && (
                     <div className="bg-white p-6 rounded-xl shadow-md border">
                         <h3 className="text-lg font-bold text-neutral-800 mb-4">Connect with {agent.name}</h3>
                         <div className="space-y-3">
                             {agent.websiteUrl && (
                                 <a
                                     href={agent.websiteUrl}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex items-center gap-3 text-neutral-700 hover:text-primary transition-colors"
                                 >
                                     <GlobeAltIcon className="w-5 h-5" />
                                     <span>Visit Website</span>
                                 </a>
                             )}
                             {agent.facebookUrl && (
                                 <a
                                     href={agent.facebookUrl}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex items-center gap-3 text-neutral-700 hover:text-blue-600 transition-colors"
                                 >
                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                     </svg>
                                     <span>Facebook</span>
                                 </a>
                             )}
                             {agent.instagramUrl && (
                                 <a
                                     href={agent.instagramUrl}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex items-center gap-3 text-neutral-700 hover:text-pink-600 transition-colors"
                                 >
                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                         <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                     </svg>
                                     <span>Instagram</span>
                                 </a>
                             )}
                             {agent.linkedinUrl && (
                                 <a
                                     href={agent.linkedinUrl}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="flex items-center gap-3 text-neutral-700 hover:text-blue-700 transition-colors"
                                 >
                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                         <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                     </svg>
                                     <span>LinkedIn</span>
                                 </a>
                             )}
                         </div>
                     </div>
                 )}

                 <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Client Testimonials</h2>
                     {canWriteReview && !showReviewForm && (
                         <button
                             onClick={() => setShowReviewForm(true)}
                             className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm"
                         >
                             Write Review
                         </button>
                     )}
                 </div>

                 {/* Review Form */}
                 {showReviewForm && canWriteReview && (
                     <div className="mb-6">
                         <AgentReviewForm
                             agentId={agent.id}
                             agentName={agent.name}
                             onReviewSubmitted={handleReviewSubmitted}
                         />
                     </div>
                 )}

                 {/* Login Prompt */}
                 {!currentUser && (
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                         <p className="text-blue-800 text-sm">
                             Please <button
                                 onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } })}
                                 className="font-semibold underline hover:text-blue-900"
                             >
                                 log in
                             </button> to write a review for this agent.
                         </p>
                     </div>
                 )}

                 {/* Testimonials List */}
                 {agent.testimonials && agent.testimonials.length > 0 ? (
                     <div className="space-y-6">
                        {agent.testimonials.map((t, index) => {
                            const reviewDate = t.createdAt ? new Date(t.createdAt) : null;
                            const formattedDate = reviewDate ? reviewDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) : null;

                            return (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-md border">
                                    {/* Reviewer Info */}
                                    <div className="flex items-start gap-3 mb-4">
                                        {t.userId?.avatarUrl ? (
                                            <img
                                                src={t.userId.avatarUrl}
                                                alt={t.userId.name || t.clientName}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-neutral-200"
                                            />
                                        ) : (
                                            <UserCircleIcon className="w-12 h-12 text-neutral-400" />
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <h4 className="font-bold text-neutral-900">{t.userId?.name || t.clientName}</h4>
                                                {formattedDate && (
                                                    <span className="text-xs text-neutral-500">{formattedDate}</span>
                                                )}
                                            </div>
                                            <StarRating rating={t.rating} className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-neutral-700 leading-relaxed">"{t.quote}"</p>
                                </div>
                            );
                        })}
                     </div>
                 ) : (
                    <div className="text-center p-8 bg-white rounded-lg border">
                        <p className="text-neutral-600">No testimonials yet.</p>
                        {canWriteReview && !showReviewForm && (
                            <p className="text-neutral-500 text-sm mt-2">Be the first to write a review!</p>
                        )}
                    </div>
                 )}
            </div>
        </div>

      </main>
    </div>
  );
};

export default AgentProfilePage;
