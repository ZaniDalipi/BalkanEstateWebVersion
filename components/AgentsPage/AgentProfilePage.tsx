import React, { useState } from 'react';
import { Agent } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeftIcon, BuildingOfficeIcon, ChartBarIcon, ChatBubbleBottomCenterTextIcon, EnvelopeIcon, PhoneIcon, CheckCircleIcon, UserCircleIcon } from '../../constants';
import StarRating from '../shared/StarRating';
import { formatPrice } from '../../utils/currency';
import PropertyCard from '../BuyerFlow/PropertyCard';
import PropertyCardSkeleton from '../BuyerFlow/PropertyCardSkeleton';
import AgentReviewForm from '../shared/AgentReviewForm';
import { slugify } from '../../utils/slug';

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

    const handleBack = () => {
        dispatch({ type: 'SET_SELECTED_AGENT', payload: null });
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        // Refresh agent data to show new review
        window.location.reload();
    };

    const handleAgencyClick = () => {
        if (agent.agencyName) {
            const agencySlug = slugify(agent.agencyName);
            dispatch({ type: 'SET_SELECTED_AGENCY', payload: agencySlug });
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
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-neutral-200 flex flex-col md:flex-row items-center gap-8 mb-8">
            <ProfileAvatar agent={agent} />
            <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900">{agent.name}</h1>
                    {agent.licenseNumber && (
                        <div className="flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                            <CheckCircleIcon className="w-5 h-5"/>
                            <span>Trusted Agent</span>
                        </div>
                    )}
                </div>

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

                <div className="flex items-center justify-center md:justify-start gap-2">
                    {agent.rating > 0 ? (
                        <>
                            <StarRating rating={agent.rating} />
                            <span className="text-lg font-bold text-neutral-700">{agent.rating.toFixed(1)}</span>
                        </>
                    ) : (
                        <span className="text-sm text-neutral-500 italic">No reviews yet</span>
                    )}
                </div>
                <div className="mt-4 flex items-center justify-center md:justify-start flex-wrap gap-x-6 gap-y-2 text-neutral-600">
                    <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-primary"><PhoneIcon className="w-5 h-5"/>{agent.phone}</a>
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-primary"><EnvelopeIcon className="w-5 h-5"/>{agent.email}</a>
                </div>
            </div>
        </div>
        
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
            <div>
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
