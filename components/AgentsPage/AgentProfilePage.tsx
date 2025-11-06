import React, { useState } from 'react';
import { Agent } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeftIcon, BuildingOfficeIcon, ChartBarIcon, ChatBubbleBottomCenterTextIcon, EnvelopeIcon, PhoneIcon, CheckCircleIcon, UserCircleIcon } from '../../constants';
import StarRating from '../shared/StarRating';
import { formatPrice } from '../../utils/currency';
import PropertyCard from '../BuyerFlow/PropertyCard';
import PropertyCardSkeleton from '../BuyerFlow/PropertyCardSkeleton';

interface AgentProfilePageProps {
  agent: Agent;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-primary-light p-4 rounded-lg flex items-center gap-4">
        <div className="bg-white p-3 rounded-full text-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-primary-dark/80">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-primary-dark">{value}</p>
        </div>
    </div>
);

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
    const { isLoadingProperties } = state;
    const agentProperties = state.properties.filter(p => p.sellerId === agent.id && p.status === 'active');
    
    const handleBack = () => {
        dispatch({ type: 'SET_SELECTED_AGENT', payload: null });
    };

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

                <div className="flex items-center justify-center md:justify-start gap-2">
                    <StarRating rating={agent.rating} />
                    <span className="text-lg font-bold text-neutral-700">{agent.rating.toFixed(1)}</span>
                </div>
                <div className="mt-4 flex items-center justify-center md:justify-start flex-wrap gap-x-6 gap-y-2 text-neutral-600">
                    <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-primary"><PhoneIcon className="w-5 h-5"/>{agent.phone}</a>
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-primary"><EnvelopeIcon className="w-5 h-5"/>{agent.email}</a>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard label="Total Sales Value" value={formatPrice(agent.totalSalesValue, 'Serbia')} icon={<ChartBarIcon className="w-6 h-6"/>} />
            <StatCard label="Properties Sold" value={agent.propertiesSold} icon={<BuildingOfficeIcon className="w-6 h-6"/>} />
            <StatCard label="Active Listings" value={agent.activeListings} icon={<BuildingOfficeIcon className="w-6 h-6"/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-4">Active Listings</h2>
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
                        <p className="text-neutral-600">{agent.name} has no active listings at the moment.</p>
                    </div>
                )}
            </div>
            <div>
                 <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 mb-4">Client Testimonials</h2>
                 {agent.testimonials && agent.testimonials.length > 0 ? (
                     <div className="space-y-6">
                        {agent.testimonials.map((t, index) => (
                             <div key={index} className="bg-white p-6 rounded-xl shadow-md border">
                                <div className="flex items-center gap-2 mb-2">
                                    <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-neutral-700 italic">"{t.quote}"</p>
                                <p className="text-right font-semibold text-neutral-800 mt-3">- {t.clientName}</p>
                             </div>
                        ))}
                     </div>
                 ) : (
                    <div className="text-center p-8 bg-white rounded-lg border">
                        <p className="text-neutral-600">No testimonials yet.</p>
                    </div>
                 )}
            </div>
        </div>

      </main>
    </div>
  );
};

export default AgentProfilePage;
