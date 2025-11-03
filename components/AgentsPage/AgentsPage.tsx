import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Agent, User, UserRole, Property } from '../../types';
import { mockUsers } from '../../services/propertyService';
import AgentCard from './AgentCard';
import AgentProfilePage from './AgentProfilePage';
import { Bars3Icon, Squares2x2Icon, TrophyIcon, CheckCircleIcon } from '../../constants';
import StarRating from '../shared/StarRating';
import { formatPrice } from '../../utils/currency';

type SortKey = 'sales' | 'rating' | 'name' | 'sold';
type ViewMode = 'grid' | 'list';

const calculateAgentStats = (users: { [key: string]: User }, properties: Property[]): Agent[] => {
  const agents = Object.values(users).filter(u => u.role === UserRole.AGENT);
  
  const agentStats = agents.map(agentUser => {
    const agentProperties = properties.filter(p => p.sellerId === agentUser.id);
    const soldProperties = agentProperties.filter(p => p.status === 'sold');
    
    const totalSalesValue = soldProperties.reduce((sum, p) => sum + p.price, 0);
    const propertiesSold = soldProperties.length;
    const activeListings = agentProperties.filter(p => p.status === 'active').length;
    
    // Mock rating based on sales and testimonials
    const rating = Math.min(5, 3.5 + (propertiesSold * 0.1) + (agentUser.testimonials?.length || 0) * 0.2);

    return {
      ...agentUser,
      totalSalesValue,
      propertiesSold,
      activeListings,
      rating,
    };
  });

  return agentStats;
};

const AgentsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { properties, selectedAgentId } = state;
  
  const [sortBy, setSortBy] = useState<SortKey>('sales');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const agentsWithStats = useMemo(() => calculateAgentStats(mockUsers, properties), [properties]);
  
  const uniqueLocations = useMemo(() => {
    const locations = new Set(properties.map(p => `${p.city}, ${p.country}`));
    return ['All Locations', ...Array.from(locations).sort()];
  }, [properties]);

  const sortedAgents = useMemo(() => {
    let filtered = [...agentsWithStats];

    if (locationFilter !== 'all') {
        const [city, country] = locationFilter.split(', ');
        filtered = agentsWithStats.filter(agent => 
            properties.some(prop => prop.sellerId === agent.id && prop.city === city && prop.country === country)
        );
    }
    
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'sold':
          return b.propertiesSold - a.propertiesSold;
        case 'sales':
        default:
          return b.totalSalesValue - a.totalSalesValue;
      }
    });
    return sorted;
  }, [agentsWithStats, sortBy, locationFilter, properties]);
  
  const selectedAgent = useMemo(() => {
      if (!selectedAgentId) return null;
      return sortedAgents.find(a => a.id === selectedAgentId) || null;
  }, [selectedAgentId, sortedAgents]);

  const handleSelectAgent = (id: string) => {
    dispatch({ type: 'SET_SELECTED_AGENT', payload: id });
  };
  
  if (selectedAgent) {
      return <AgentProfilePage agent={selectedAgent} />;
  }

  return (
    <div className="bg-neutral-50 min-h-full">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
            <TrophyIcon className="w-12 h-12 text-primary mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-neutral-900">Top Agents</h1>
            <p className="text-lg text-neutral-600 mt-2">
                Discover the best real estate agents in the Balkans.
            </p>
        </div>
        
        <div className="mb-6 bg-white p-3 rounded-lg shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="location-filter" className="text-sm font-semibold text-neutral-700 whitespace-nowrap">Location:</label>
                    <div className="relative">
                        <select 
                            id="location-filter"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="appearance-none block w-full bg-neutral-100 border border-neutral-200 text-neutral-800 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 text-sm font-semibold"
                        >
                            {uniqueLocations.map(loc => <option key={loc} value={loc === 'All Locations' ? 'all' : loc}>{loc}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="sort-by" className="text-sm font-semibold text-neutral-700 whitespace-nowrap">Sort by:</label>
                     <div className="relative">
                        <select 
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortKey)}
                            className="appearance-none block w-full bg-neutral-100 border border-neutral-200 text-neutral-800 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 text-sm font-semibold"
                        >
                            <option value="sales">Total Sales</option>
                            <option value="sold">Properties Sold</option>
                            <option value="rating">Rating</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-md border">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-neutral-500 hover:bg-neutral-200'}`}><Squares2x2Icon className="w-5 h-5"/></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-neutral-500 hover:bg-neutral-200'}`}><Bars3Icon className="w-5 h-5"/></button>
            </div>
        </div>

        {viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAgents.map((agent, index) => (
                    <AgentCard key={agent.id} agent={agent} rank={index + 1} />
                ))}
            </div>
        ) : (
            <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                <div className="divide-y divide-neutral-100">
                     {sortedAgents.map((agent, index) => (
                        <div key={agent.id} onClick={() => handleSelectAgent(agent.id)} className={`p-4 flex items-center gap-4 hover:bg-neutral-50 cursor-pointer transition-colors`}>
                            <span className="font-bold text-lg text-neutral-500 w-8 text-center">#{index + 1}</span>
                            <img src={agent.avatarUrl} alt={agent.name} className="w-12 h-12 rounded-full object-cover"/>
                            <div className="flex-grow">
                                <p className="font-bold text-neutral-800">{agent.name}</p>
                                {agent.city && agent.country && (
                                    <p className="text-sm text-neutral-500 font-medium -mt-1">{agent.city}, {agent.country}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                    <StarRating rating={agent.rating} className="w-4 h-4"/>
                                    {agent.licenseNumber && (
                                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                            <CheckCircleIcon className="w-3.5 h-3.5"/>
                                            <span>Trusted</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                             <div className="text-right flex-shrink-0 w-32">
                                <p className="font-bold text-primary">{formatPrice(agent.totalSalesValue, 'Serbia')}</p>
                                <p className="text-xs text-neutral-500">{agent.propertiesSold} properties sold</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AgentsPage;