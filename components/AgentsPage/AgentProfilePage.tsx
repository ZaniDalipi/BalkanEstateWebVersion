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
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
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

// Custom marker icons for active and sold properties
const activeMarkerIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 16px; margin-top: 3px; margin-left: 7px;">●</div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

const soldMarkerIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: #6b7280; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 16px; margin-top: 3px; margin-left: 7px;">✓</div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

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
            <div className="h-64 sm:h-80 md:h-96 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
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

    // Determine appropriate zoom level based on property spread
    const zoom = useMemo(() => {
        if (validProperties.length === 1) return 15;

        const lats = validProperties.map(p => p.lat);
        const lngs = validProperties.map(p => p.lng);
        const latSpread = Math.max(...lats) - Math.min(...lats);
        const lngSpread = Math.max(...lngs) - Math.min(...lngs);
        const maxSpread = Math.max(latSpread, lngSpread);

        if (maxSpread < 0.01) return 14;
        if (maxSpread < 0.05) return 12;
        if (maxSpread < 0.1) return 11;
        if (maxSpread < 0.5) return 10;
        return 9;
    }, [validProperties]);

    return (
        <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="w-full h-full"
                style={{ zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validProperties.map((property) => {
                    const isSold = property.status === 'sold';
                    // Simulate cadastre bounds with a circle (radius: ~50m)
                    const cadastreRadius = 50;

                    return (
                        <React.Fragment key={property.id}>
                            {/* Cadastre boundary circle */}
                            <Circle
                                center={[property.lat, property.lng]}
                                radius={cadastreRadius}
                                pathOptions={{
                                    color: isSold ? '#6b7280' : '#10b981',
                                    fillColor: isSold ? '#6b7280' : '#10b981',
                                    fillOpacity: 0.1,
                                    weight: 2,
                                    opacity: 0.5
                                }}
                            />

                            {/* Property marker */}
                            <Marker
                                position={[property.lat, property.lng]}
                                icon={isSold ? soldMarkerIcon : activeMarkerIcon}
                            >
                                <Popup maxWidth={250}>
                                    <div className="text-sm p-2">
                                        <div className="mb-2">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                                                isSold ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {isSold ? '✓ SOLD' : '● ACTIVE'}
                                            </span>
                                        </div>
                                        <p className="font-bold text-lg mb-1">{formatPrice(property.price, 'Serbia')}</p>
                                        <p className="text-neutral-700 mb-2">{property.address}</p>
                                        <p className="text-neutral-600 text-xs">
                                            {property.beds} beds • {property.baths} baths • {property.sqft} sqft
                                        </p>
                                        {property.propertyType && (
                                            <p className="text-neutral-500 text-xs mt-1 capitalize">{property.propertyType}</p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        </React.Fragment>
                    );
                })}
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
    <div className="bg-white min-h-full animate-fade-in">
       {/* Navigation */}
       <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button onClick={handleBack} className="flex items-center gap-2 text-primary font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Leaderboard
                </button>
            </div>
        </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header Section */}
        <div className="py-8 border-b border-neutral-200">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left: Profile */}
                <div className="flex flex-col items-center md:items-start">
                    <ProfileAvatar agent={agent} />

                    {/* Contact Buttons */}
                    <div className="flex flex-col gap-3 w-full mt-6">
                        <a
                            href={`tel:${agent.phone}`}
                            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-all shadow-md"
                        >
                            <PhoneIcon className="w-5 h-5" />
                            Call {agent.name.split(' ')[0]}
                        </a>
                        <a
                            href={`mailto:${agent.email}`}
                            className="flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg font-bold hover:bg-primary-light transition-all"
                        >
                            <EnvelopeIcon className="w-5 h-5" />
                            Email {agent.name.split(' ')[0]}
                        </a>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">{agent.name}</h1>

                    {agent.agencyName && (
                        <div
                            className="mb-4 inline-flex items-center gap-2 bg-neutral-100 text-neutral-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-neutral-200 transition-all"
                            onClick={handleAgencyClick}
                            title="View agency profile"
                        >
                            <BuildingOfficeIcon className="w-5 h-5" />
                            <span className="font-semibold">{agent.agencyName}</span>
                        </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-6">
                        {agent.rating > 0 ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <StarRating rating={agent.rating} />
                                </div>
                                <span className="text-2xl font-bold text-neutral-900">{agent.rating.toFixed(1)}</span>
                                {agent.totalReviews && (
                                    <span className="text-neutral-600">• {agent.totalReviews} {agent.totalReviews === 1 ? 'review' : 'reviews'}</span>
                                )}
                            </>
                        ) : (
                            <span className="text-neutral-500 italic">No reviews yet</span>
                        )}
                    </div>

                    {/* Agent Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {agent.yearsOfExperience && (
                            <div>
                                <p className="text-neutral-600 mb-1">Experience</p>
                                <p className="font-semibold text-neutral-900">{agent.yearsOfExperience} years in real estate</p>
                            </div>
                        )}
                        {agent.languages && agent.languages.length > 0 && (
                            <div>
                                <p className="text-neutral-600 mb-1">Languages</p>
                                <p className="font-semibold text-neutral-900">{agent.languages.join(', ')}</p>
                            </div>
                        )}
                        {agent.specializations && agent.specializations.length > 0 && (
                            <div>
                                <p className="text-neutral-600 mb-1">Specializations</p>
                                <p className="font-semibold text-neutral-900">{agent.specializations.join(', ')}</p>
                            </div>
                        )}
                        {agent.officeAddress && (
                            <div>
                                <p className="text-neutral-600 mb-1">Office Location</p>
                                <p className="font-semibold text-neutral-900 flex items-start gap-1">
                                    <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{agent.officeAddress}</span>
                                </p>
                            </div>
                        )}
                        {agent.officePhone && (
                            <div>
                                <p className="text-neutral-600 mb-1">Office Phone</p>
                                <a href={`tel:${agent.officePhone}`} className="font-semibold text-primary hover:underline">
                                    {agent.officePhone}
                                </a>
                            </div>
                        )}
                        <div>
                            <p className="text-neutral-600 mb-1">Email</p>
                            <a href={`mailto:${agent.email}`} className="font-semibold text-primary hover:underline">
                                {agent.email}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="py-8 border-b border-neutral-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-neutral-50 rounded-lg">
                    <p className="text-neutral-600 text-sm font-semibold mb-2">TOTAL SALES VALUE</p>
                    <p className="text-3xl font-bold text-neutral-900">{formatPrice(agent.totalSalesValue, 'Serbia')}</p>
                </div>
                <div
                    className={`text-center p-6 rounded-lg cursor-pointer transition-all ${
                        propertyView === 'sold' ? 'bg-primary text-white shadow-lg' : 'bg-neutral-50 hover:bg-neutral-100'
                    }`}
                    onClick={() => setPropertyView('sold')}
                >
                    <p className={`text-sm font-semibold mb-2 ${propertyView === 'sold' ? 'text-white' : 'text-neutral-600'}`}>
                        PROPERTIES SOLD
                    </p>
                    <p className={`text-3xl font-bold ${propertyView === 'sold' ? 'text-white' : 'text-neutral-900'}`}>
                        {agent.propertiesSold}
                    </p>
                </div>
                <div
                    className={`text-center p-6 rounded-lg cursor-pointer transition-all ${
                        propertyView === 'active' ? 'bg-primary text-white shadow-lg' : 'bg-neutral-50 hover:bg-neutral-100'
                    }`}
                    onClick={() => setPropertyView('active')}
                >
                    <p className={`text-sm font-semibold mb-2 ${propertyView === 'active' ? 'text-white' : 'text-neutral-600'}`}>
                        ACTIVE LISTINGS
                    </p>
                    <p className={`text-3xl font-bold ${propertyView === 'active' ? 'text-white' : 'text-neutral-900'}`}>
                        {agent.activeListings}
                    </p>
                </div>
            </div>
        </div>

        {/* Bio/About Section */}
        {agent.bio && (
            <div className="py-8 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">About {agent.name.split(' ')[0]}</h2>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap text-base">{agent.bio}</p>
            </div>
        )}

        {/* Featured Listings */}
        {featuredProperties.length > 0 && (
            <div className="py-8 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Featured Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProperties.map(prop => (
                        <PropertyCard key={prop.id} property={prop} />
                    ))}
                </div>
            </div>
        )}

        {/* Properties Map */}
        {allAgentProperties.length > 0 && (
            <div className="py-8 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900">Property Locations</h2>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-neutral-600">Active ({allAgentProperties.filter(p => p.status === 'active').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                            <span className="text-neutral-600">Sold ({allAgentProperties.filter(p => p.status === 'sold').length})</span>
                        </div>
                    </div>
                </div>
                <AgentPropertiesMap properties={allAgentProperties} />
                <p className="text-xs text-neutral-500 mt-3 text-center">
                    Circles represent approximate property boundaries • Click markers for details
                </p>
            </div>
        )}

        {/* All Listings Section */}
        <div className="py-8 border-b border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                {propertyView === 'active' ? 'Active Listings' : 'Sold Properties'} ({agentProperties.length})
            </h2>
            {isLoadingProperties ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                </div>
            ) : agentProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agentProperties.map(prop => <PropertyCard key={prop.id} property={prop} />)}
                </div>
            ) : (
                <div className="text-center p-12 bg-neutral-50 rounded-lg">
                    <p className="text-neutral-600 text-lg">
                        {propertyView === 'active'
                            ? `${agent.name} has no active listings at the moment.`
                            : `${agent.name} has no sold properties yet.`
                        }
                    </p>
                </div>
            )}
        </div>

        {/* Reviews Section */}
        <div className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Client Reviews</h2>
                {canWriteReview && !showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                        Write a Review
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
                    <p className="text-blue-700">
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
                <div className="space-y-4">
                    {agent.testimonials.map((t, index) => {
                        const reviewDate = t.createdAt ? new Date(t.createdAt) : null;
                        const formattedDate = reviewDate ? reviewDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : null;

                        return (
                            <div key={index} className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                {/* Rating and Date */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={t.rating} />
                                        <span className="font-bold text-neutral-900">{t.rating.toFixed(1)}</span>
                                    </div>
                                    {formattedDate && (
                                        <span className="text-sm text-neutral-500">{formattedDate}</span>
                                    )}
                                </div>

                                {/* Review Text */}
                                <p className="text-neutral-700 leading-relaxed mb-4">"{t.quote}"</p>

                                {/* Reviewer Info */}
                                <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                                    {t.userId?.avatarUrl ? (
                                        <img
                                            src={t.userId.avatarUrl}
                                            alt={t.userId.name || t.clientName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <UserCircleIcon className="w-10 h-10 text-neutral-400" />
                                    )}
                                    <div>
                                        <p className="font-semibold text-neutral-900">{t.userId?.name || t.clientName}</p>
                                        <p className="text-sm text-neutral-500">Verified Client</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center p-12 bg-neutral-50 rounded-lg">
                    <p className="text-neutral-600 text-lg">No reviews yet</p>
                    {canWriteReview && !showReviewForm && (
                        <p className="text-neutral-500 mt-2">Be the first to write a review!</p>
                    )}
                </div>
            )}
        </div>

        {/* Social Media Links */}
        {(agent.websiteUrl || agent.facebookUrl || agent.instagramUrl || agent.linkedinUrl) && (
            <div className="py-8 border-t border-neutral-200">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Connect with {agent.name.split(' ')[0]}</h3>
                <div className="flex flex-wrap gap-4">
                    {agent.websiteUrl && (
                        <a
                            href={agent.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                            <GlobeAltIcon className="w-5 h-5 text-neutral-700" />
                            <span className="font-medium text-neutral-700">Website</span>
                        </a>
                    )}
                    {agent.facebookUrl && (
                        <a
                            href={agent.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span className="font-medium text-blue-700">Facebook</span>
                        </a>
                    )}
                    {agent.instagramUrl && (
                        <a
                            href={agent.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span className="font-medium text-pink-700">Instagram</span>
                        </a>
                    )}
                    {agent.linkedinUrl && (
                        <a
                            href={agent.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            <span className="font-medium text-blue-800">LinkedIn</span>
                        </a>
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AgentProfilePage;
