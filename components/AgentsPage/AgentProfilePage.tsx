import React from 'react';
import { Agent, Property } from '../../types';
import StarRating from '../shared/StarRating';
import { ArrowLeftIcon, PhoneIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import PropertyCard from '../BuyerFlow/PropertyCard';

interface AgentProfilePageProps {
    agent: Agent & { propertiesSold: number; totalSales: number; };
    onBack: () => void;
}

const AgentProfilePage: React.FC<AgentProfilePageProps> = ({ agent, onBack }) => {
    const { state } = useAppContext();
    const agentListings = state.properties.filter(p => p.sellerId === agent.id && p.status === 'active');

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-primary font-semibold mb-6 hover:underline">
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Leaderboard
            </button>

            {/* Agent Header */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-neutral-200">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <img src={agent.avatarUrl} alt={agent.name} className="w-32 h-32 rounded-full object-cover border-4 border-primary-light shadow-md" />
                    <div className="flex-grow text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-neutral-900">{agent.name}</h1>
                        <p className="text-lg text-neutral-600 font-medium">{agent.agency}</p>
                        <div className="my-2 flex justify-center sm:justify-start">
                             <StarRating rating={agent.rating} reviewCount={agent.reviewCount} size="md"/>
                        </div>
                        <div className="mt-3 flex justify-center sm:justify-start flex-wrap gap-2">
                            {agent.specialties.map(s => <span key={s} className="bg-primary-light text-primary-dark text-xs font-semibold px-2.5 py-1 rounded-full">{s}</span>)}
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                         <a href={`tel:${agent.phone}`} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-dark transition-colors">
                            <PhoneIcon className="w-5 h-5"/>
                            Call Agent
                        </a>
                         <a href={`mailto:${agent.email}`} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-neutral-700 font-semibold rounded-lg border border-neutral-300 hover:bg-neutral-50 transition-colors">
                            <EnvelopeIcon className="w-5 h-5"/>
                            Email Agent
                        </a>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 text-center gap-4">
                     <div>
                        <p className="font-bold text-3xl text-primary">{agent.propertiesSold}</p>
                        <p className="text-sm text-neutral-500 uppercase font-semibold">Properties Sold</p>
                    </div>
                     <div>
                        <p className="font-bold text-3xl text-primary">{agent.totalSales.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                        <p className="text-sm text-neutral-500 uppercase font-semibold">Total Sales Value</p>
                    </div>
                </div>
            </div>

            {/* Active Listings */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">Active Listings ({agentListings.length})</h2>
                {agentListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agentListings.map(prop => <PropertyCard key={prop.id} property={prop} />)}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-lg border text-center">
                        <p className="text-neutral-600">{agent.name} currently has no active listings.</p>
                    </div>
                )}
            </div>
            
            {/* Testimonials */}
            {agent.testimonials && agent.testimonials.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-neutral-800 mb-4">What Clients Are Saying</h2>
                     <div className="space-y-4">
                        {agent.testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg border shadow-sm">
                                <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-primary/50 mb-2" />
                                <p className="italic text-neutral-700">"{testimonial.quote}"</p>
                                <p className="text-right font-semibold text-neutral-800 mt-3">- {testimonial.clientName}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentProfilePage;