import React, { useState, useMemo } from 'react';
import { Agent, User, UserRole } from '../../types';
import AgentCard from './AgentCard';
import AgentProfilePage from './AgentProfilePage';
import { useAppContext } from '../../context/AppContext';
import { mockUsers } from '../../services/propertyService';
import { Squares2x2Icon, Bars3Icon, TrophyIcon } from '../../constants';
import StarRating from '../shared/StarRating';
import { formatPrice } from '../../utils/currency';

type SortOption = 'properties_sold' | 'total_sales' | 'rating' | 'reviews';

const AgentsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { properties, selectedAgentId } = state;
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [sortOption, setSortOption] = useState<SortOption>('properties_sold');

    const agentPerformance = useMemo(() => {
        const sellersAsAgents: Agent[] = Object.values(mockUsers)
            .filter(u => u.role === UserRole.SELLER)
            .map(u => ({
                ...u,
                rating: (u.id === 'user_seller_1' ? 4.8 : 4.5), // mock data
                reviewCount: (u.id === 'user_seller_1' ? 82 : 55), // mock data
                specialties: (u.id === 'user_seller_1' ? ['Luxury Apartments', 'New Development'] : ['Family Homes']),
                agency: 'Balkan Estate'
            }));

        const performanceData = sellersAsAgents.map(agent => {
            const soldProperties = properties.filter(p => p.sellerId === agent.id && p.status === 'sold');
            const propertiesSold = soldProperties.length;
            const totalSales = soldProperties.reduce((sum, p) => sum + p.price, 0);
            return { ...agent, propertiesSold, totalSales };
        });

        return performanceData.sort((a, b) => {
            switch (sortOption) {
                case 'total_sales':
                    return b.totalSales - a.totalSales;
                case 'rating':
                    return b.rating - a.rating;
                case 'reviews':
                    return b.reviewCount - a.reviewCount;
                case 'properties_sold':
                default:
                    return b.propertiesSold - a.propertiesSold;
            }
        });

    }, [properties, sortOption]);
    
    const selectedAgent = useMemo(() => {
        if (!selectedAgentId) return null;
        return agentPerformance.find(agent => agent.id === selectedAgentId) || null;
    }, [selectedAgentId, agentPerformance]);


    const handleSelectAgent = (agentId: string) => {
        dispatch({ type: 'SET_SELECTED_AGENT', payload: agentId });
    };

    if (selectedAgent) {
        return <AgentProfilePage agent={selectedAgent} onBack={() => dispatch({ type: 'SET_SELECTED_AGENT', payload: null })} />;
    }
    
    const rankColors = [
        'border-yellow-400 bg-yellow-50', // Gold
        'border-neutral-300 bg-neutral-100', // Silver
        'border-yellow-600/50 bg-yellow-50/50' // Bronze
    ];

    const rankTextColors = ['text-yellow-500', 'text-neutral-500', 'text-yellow-700'];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-900">Top Agents</h1>
                <p className="text-lg text-neutral-600 mt-2 max-w-2xl mx-auto">
                    Discover the most successful agents in the Balkan region, ranked by their sales performance.
                </p>
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <div className="relative">
                     <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="pl-4 pr-10 py-2 text-sm font-semibold bg-white border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                    >
                        <option value="properties_sold">Sort by: Most Properties Sold</option>
                        <option value="total_sales">Sort by: Highest Sales Value</option>
                        <option value="rating">Sort by: Highest Rating</option>
                        <option value="reviews">Sort by: Most Reviews</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>

                <div className="bg-neutral-200 p-1 rounded-lg flex items-center">
                    <button onClick={() => setViewMode('card')} className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-white shadow' : 'text-neutral-500'}`}><Squares2x2Icon className="w-5 h-5"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : 'text-neutral-500'}`}><Bars3Icon className="w-5 h-5"/></button>
                </div>
            </div>

            {viewMode === 'card' ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agentPerformance.map((agent, index) => (
                        <AgentCard key={agent.id} agent={{...agent, rank: index + 1}} onSelectAgent={() => handleSelectAgent(agent.id)} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider w-12">Rank</th>
                                <th className="p-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Agent</th>
                                <th className="p-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Rating</th>
                                <th className="p-4 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Properties Sold</th>
                                <th className="p-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Total Sales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {agentPerformance.map((agent, index) => (
                                <tr key={agent.id} onClick={() => handleSelectAgent(agent.id)} className="hover:bg-neutral-50 cursor-pointer">
                                    <td className="p-4 text-center">
                                        <span className={`font-bold text-lg ${rankTextColors[index] || 'text-neutral-500'}`}>{index + 1}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={agent.avatarUrl} alt={agent.name} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-semibold text-neutral-800">{agent.name}</p>
                                                <p className="text-xs text-neutral-500">{agent.agency}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><StarRating rating={agent.rating} reviewCount={agent.reviewCount} size="sm"/></td>
                                    <td className="p-4 text-center font-semibold text-neutral-800">{agent.propertiesSold}</td>
                                    <td className="p-4 text-right font-semibold text-neutral-800">{formatPrice(agent.totalSales, 'Serbia')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AgentsPage;