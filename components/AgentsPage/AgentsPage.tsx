import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Agent, Property } from '../../types';
import { getAllAgents } from '../../services/apiService';
import AgentCard from './AgentCard';
import AgentProfilePage from './AgentProfilePage';
import { Bars3Icon, Squares2x2Icon, TrophyIcon, UserGroupIcon } from '../../constants';
import StarRating from '../shared/StarRating';
import { formatPrice } from '../../utils/currency';
import AdvertisementBanner from '../AdvertisementBanner';
import Footer from '../shared/Footer';

type SortKey = 'sales' | 'rating' | 'name' | 'sold';
type ViewMode = 'grid' | 'list';

const AgentsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { properties, selectedAgentId, activeView } = state;

  const [sortBy, setSortBy] = useState<SortKey>('sales');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Refetch agents whenever the agents page becomes active
  useEffect(() => {
    if (activeView === 'agents') {
      fetchAgents();
    }
  }, [activeView]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await getAllAgents();
      setAgents(response.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };
  
  const uniqueLocations = useMemo(() => {
    const locations = new Set(
      agents
        .filter(a => a.city && a.country)
        .map(a => `${a.city}, ${a.country}`)
    );
    return ['All Locations', ...Array.from(locations).sort()];
  }, [agents]);

  const sortedAgents = useMemo(() => {
    let filtered = [...agents];

    if (locationFilter !== 'all') {
      const [city, country] = locationFilter.split(', ');
      filtered = agents.filter(agent => agent.city === city && agent.country === country);
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
  }, [agents, sortBy, locationFilter]);
  
  const selectedAgent = useMemo(() => {
      if (!selectedAgentId) return null;
      // Try to find by agentId first, then fallback to id
      return sortedAgents.find(a => a.agentId === selectedAgentId || a.id === selectedAgentId) || null;
  }, [selectedAgentId, sortedAgents]);

  const handleSelectAgent = (id: string) => {
    dispatch({ type: 'SET_SELECTED_AGENT', payload: id });
  };
  
  if (selectedAgent) {
      return <AgentProfilePage agent={selectedAgent} />;
  }

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-full">
      <AdvertisementBanner position="top" />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
            <UserGroupIcon className="w-12 h-12 text-primary mx-auto mb-2" />
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
                            className="appearance-none block w-full bg-neutral-100 border border-neutral-200 text-neutral-800 py-1.5 sm:py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 text-sm font-semibold"
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
                            className="appearance-none block w-full bg-neutral-100 border border-neutral-200 text-neutral-800 py-1.5 sm:py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/50 text-sm font-semibold"
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

        {sortedAgents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border p-12 text-center">
            <TrophyIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No agents found</h3>
            <p className="text-neutral-600">
              {locationFilter !== 'all'
                ? 'Try selecting a different location'
                : 'No agents available at this time'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AgentsPage;