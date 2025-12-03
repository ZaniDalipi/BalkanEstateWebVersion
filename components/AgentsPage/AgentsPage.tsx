import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Agent, Agency } from '../../types';
import { getAllAgents, getAgencies } from '../../services/apiService';
import AgentCard from './AgentCard';
import AgentProfilePage from './AgentProfilePage';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon, UserGroupIcon, PhoneIcon, BuildingOfficeIcon } from '../../constants';
import AdvertisementBanner from '../AdvertisementBanner';
import Footer from '../shared/Footer';

type SearchTab = 'location' | 'name';

const AgentsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { selectedAgentId, activeView } = state;

  const [searchTab, setSearchTab] = useState<SearchTab>('location');
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    if (activeView === 'agents') {
      fetchAgents();
      fetchAgencies();
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

  const fetchAgencies = async () => {
    try {
      const response = await getAgencies({ limit: 12 });
      setAgencies(response.agencies || []);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
      setAgencies([]);
    }
  };

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;

    const query = searchQuery.toLowerCase().trim();
    return agents.filter(agent => {
      if (searchTab === 'location') {
        // Search by city, country, or both
        const city = (agent.city || '').toLowerCase();
        const country = (agent.country || '').toLowerCase();
        const fullLocation = `${city} ${country}`.trim();

        // Check if query matches city, country, or combined location
        return city.includes(query) ||
               country.includes(query) ||
               fullLocation.includes(query);
      } else {
        // Search by agent name
        return agent.name.toLowerCase().includes(query);
      }
    });
  }, [agents, searchQuery, searchTab]);

  const selectedAgent = useMemo(() => {
    if (!selectedAgentId) return null;
    return agents.find(a => a.agentId === selectedAgentId || a.id === selectedAgentId) || null;
  }, [selectedAgentId, agents]);

  const faqs = [
    {
      question: 'How to find a good real estate agent near me?',
      answer: 'Start by searching for agents in your area using our location search. Look for agents with high ratings, strong sales records, and testimonials from recent clients.'
    },
    {
      question: 'How to pick a real estate agent?',
      answer: 'Consider their experience, local market knowledge, sales track record, client reviews, and communication style. Schedule consultations with multiple agents before making your decision.'
    },
    {
      question: 'How to contact a real estate agent?',
      answer: 'You can view an agent\'s profile to find their contact information, including phone number and email. Many agents also offer convenient online booking for consultations.'
    },
    {
      question: 'How do I leave a review for a real estate agent?',
      answer: 'Visit the agent\'s profile page and click on the "Write a Review" button. Share your experience to help others make informed decisions.'
    },
    {
      question: 'What is the difference between an agent and a broker?',
      answer: 'A real estate agent is licensed to help clients buy and sell property, while a broker has additional training and certification. Brokers can work independently and manage their own agencies.'
    }
  ];

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
    <div className="bg-neutral-50 min-h-screen flex flex-col">
      <AdvertisementBanner position="top" disableGameTrigger={true} />

      {/* Hero Section with Background Image */}
      <div className="relative min-h-[400px] sm:h-96 bg-cover bg-center" style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&h=400&fit=crop)',
        backgroundPosition: 'center 40%'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/50 to-black/40"></div>
        <div className="relative max-w-4xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            A great agent makes<br />all the difference
          </h1>

          {/* Search Card */}
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Find a real estate agent</h2>

            {/* Search Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSearchTab('location')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  searchTab === 'location'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Location
              </button>
              <button
                onClick={() => setSearchTab('name')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  searchTab === 'name'
                    ? 'bg-neutral-800 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                Name
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchTab === 'location' ? 'Search by city or country (e.g., Belgrade, Serbia)' : 'Enter agent name'}
                className="w-full pl-10 pr-32 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Real Estate Agents in the Balkans
          </h2>
          <p className="text-neutral-600">
            {searchQuery ? (
              <>
                Showing <span className="font-bold text-primary">{filteredAgents.length}</span> agent{filteredAgents.length !== 1 ? 's' : ''} matching "{searchQuery}"
                {filteredAgents.length > 0 && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-primary hover:underline font-semibold"
                  >
                    Clear search
                  </button>
                )}
              </>
            ) : (
              <>
                With over {agents.length} agents from all the top brokerages, a local agent knows your market and
                can help you find the perfect home.
              </>
            )}
          </p>
        </div>

        {/* Agent Cards Grid */}
        {filteredAgents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border p-12 text-center">
            <UserGroupIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No agents found</h3>
            <p className="text-neutral-600">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}

        {/* View More Button */}
        {filteredAgents.length > 0 && (
          <div className="text-center mb-16">
            <button className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-colors">
              View more
            </button>
          </div>
        )}

        {/* Agencies Section */}
        {agencies.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Top Real Estate Agencies</h2>
                <p className="text-neutral-600">Browse agencies with experienced professionals</p>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencies' })}
                className="text-primary font-semibold hover:underline"
              >
                View all agencies →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agencies.slice(0, 8).map((agency) => {
                const handleAgencyClick = () => {
                  dispatch({ type: 'SET_SELECTED_AGENCY', payload: agency });
                  dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });
                  const urlSlug = agency.slug || agency._id;
                  window.history.pushState({}, '', `/agencies/${urlSlug}`);
                };

                return (
                  <div
                    key={agency._id}
                    onClick={handleAgencyClick}
                    className="bg-white rounded-lg shadow-md border border-neutral-200 hover:shadow-xl transition-all cursor-pointer p-4"
                  >
                    <div className="flex flex-col items-center text-center">
                      {agency.logo ? (
                        <img
                          src={agency.logo}
                          alt={agency.name}
                          className="w-16 h-16 object-contain mb-3"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center mb-3">
                          <BuildingOfficeIcon className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                      <h3 className="font-bold text-neutral-900 mb-1 line-clamp-2">{agency.name}</h3>
                      {agency.city && agency.country && (
                        <p className="text-xs text-neutral-500 mb-2">
                          {agency.city}, {agency.country}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-neutral-600 mt-2">
                        <span>{agency.totalAgents} agents</span>
                        <span>{agency.totalProperties} properties</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-16 shadow-lg" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=400&fit=crop)',
          backgroundPosition: 'center'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/70 to-neutral-900/50"></div>
          <div className="relative h-full flex flex-col justify-center items-start max-w-2xl mx-auto px-8">
            <h2 className="text-3xl font-bold text-white mb-3">Get help finding an agent</h2>
            <p className="text-lg text-white/90 mb-6">
              We'll pair you with a BalkanEstate Premier Agent who has the inside scoop on your market.
            </p>
            <button className="bg-white text-neutral-900 px-8 py-3 rounded-md font-semibold hover:bg-neutral-100 transition-colors flex items-center gap-2">
              <PhoneIcon className="w-5 h-5" />
              Connect with a local agent
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-8 md:p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently asked questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/15 transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-lg">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUpIcon className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-white/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Are you a real estate agent Section */}
        <div className="bg-white rounded-xl shadow-md border p-8 mb-8">
          <h3 className="text-2xl font-bold text-neutral-900 mb-4 text-center">
            Are you a real estate agent?
          </h3>
          <p className="text-center text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join BalkanEstate to showcase your expertise, connect with potential clients, and grow your business.
            Get access to premium tools and advertising opportunities to help you succeed in the Balkan real estate market.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                dispatch({ type: 'SET_AUTH_MODAL', payload: { isOpen: true, mode: 'login' } });
              }}
              className="px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencies' })}
              className="px-6 py-3 border-2 border-primary text-primary rounded-md font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              Browse Agencies
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentsPage;
