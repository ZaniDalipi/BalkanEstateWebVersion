import React, { useState, useEffect } from 'react';
import { Agency } from '../types';
import { getAgencies } from '../services/apiService';
import { 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  StarIcon, 
  SearchIcon,
  FilterIcon,
  TrophyIcon,
  UsersIcon,
  HomeIcon,
  CalendarIcon,
  SparklesIcon,
  ChevronRightIcon
} from '../constants';
import { useAppContext } from '../context/AppContext';
import Footer from './shared/Footer';



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AgenciesListPage: React.FC = () => {
  const { dispatch, state } = useAppContext();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'featured' | 'myAgency'>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState<'properties' | 'agents' | 'years' | 'name'>('properties');

  const currentUser = state.currentUser;
  const hasAgency = currentUser?.role === 'agent' && currentUser?.agencyId;

  useEffect(() => {
    fetchAgencies();
  }, [filter, cityFilter]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);

      if (filter === 'myAgency' && currentUser?.agencyId) {
        const response = await fetch(`${API_URL}/agencies/${currentUser.agencyId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAgencies([data.agency]);
        } else {
          setError(`Failed to load agency (${response.status})`);
          setAgencies([]);
        }
      } else {
        const response = await getAgencies({
          featured: filter === 'featured' ? true : undefined,
          city: cityFilter || undefined,
          limit: 50,
        });
        const fetchedAgencies = response.agencies || [];
        
        // Sort agencies
        const sortedAgencies = [...fetchedAgencies].sort((a, b) => {
          switch (sortBy) {
            case 'properties':
              return (b.totalProperties || 0) - (a.totalProperties || 0);
            case 'agents':
              return (b.totalAgents || 0) - (a.totalAgents || 0);
            case 'years':
              return (b.yearsInBusiness || 0) - (a.yearsInBusiness || 0);
            case 'name':
              return a.name.localeCompare(b.name);
            default:
              return 0;
          }
        });
        
        setAgencies(sortedAgencies);
      }
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
      setError('Unable to load agencies. Please try again later.');
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnterprise = () => {
    dispatch({ type: 'TOGGLE_ENTERPRISE_MODAL', payload: true });
  };

  const handleViewAgency = (agency: Agency) => {
    dispatch({ type: 'SET_SELECTED_AGENCY', payload: agency });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });
    let urlSlug = agency.slug || agency._id;
    urlSlug = urlSlug.replace(',', '/');
    window.history.pushState({}, '', `/agencies/${urlSlug}`);
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600';
    if (index === 1) return 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-500';
    if (index === 2) return 'bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600';
    return 'bg-gradient-to-br from-primary via-primary-light to-primary-dark';
  };

  const renderAgencyCard = (agency: Agency, index: number) => (
    <div
      key={agency._id}
      onClick={() => handleViewAgency(agency)}
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
    >
      {/* Gradient Accent */}
      <div className={`absolute top-0 left-0 w-2 h-full ${getRankColor(index)}`} />
      
      <div className="pl-4 pr-6 py-6">
        <div className="flex items-start gap-6">
          {/* Logo Container */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
              {agency.logo ? (
                <img
                  src={agency.logo}
                  alt={agency.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BuildingOfficeIcon className="w-10 h-10 text-primary" />
              )}
            </div>
            
            {/* Rank Badge */}
            {index < 3 && (
              <div className={`absolute -top-2 -left-2 w-8 h-8 ${getRankColor(index)} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                {index + 1}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {agency.name}
                  </h3>
                  {agency.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 rounded-full text-xs font-semibold">
                      <SparklesIcon className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>
                
                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-sm">{agency.city}, {agency.country}</span>
                </div>
              </div>
              
              <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            {/* Description */}
            {agency.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {agency.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <HomeIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{agency.totalProperties || 0}</div>
                  <div className="text-xs text-gray-500">Properties</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <UsersIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">{agency.totalAgents || 0}</div>
                  <div className="text-xs text-gray-500">Agents</div>
                </div>
              </div>
              
              {agency.yearsInBusiness && (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <CalendarIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{agency.yearsInBusiness}</div>
                    <div className="text-xs text-gray-500">Years</div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact & CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {agency.phone && (
                  <a 
                    href={`tel:${agency.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                )}
                {agency.email && (
                  <a 
                    href={`mailto:${agency.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Email</span>
                  </a>
                )}
              </div>
              
              <button className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 border border-white/20">
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
              Premier Real Estate Agencies
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Connect with top-performing agencies across the Balkans. Expert partners for your property journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCreateEnterprise}
                className="group inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all hover:scale-105 shadow-xl"
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                  <BuildingOfficeIcon className="w-5 h-5" />
                </div>
                <span>Create Your Agency</span>
              </button>
              
              <button
                onClick={() => setFilter('featured')}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all"
              >
                <StarIcon className="w-5 h-5" />
                <span>View Featured</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                All Agencies
              </button>
              <button
                onClick={() => setFilter('featured')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                  filter === 'featured'
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <StarIcon className="w-4 h-4" />
                Featured
              </button>
              {hasAgency && (
                <button
                  onClick={() => setFilter('myAgency')}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                    filter === 'myAgency'
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BuildingOfficeIcon className="w-4 h-4" />
                  My Agency
                </button>
              )}
            </div>

            {/* Sort & Search */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by city or agency name..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all focus:shadow-lg"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              >
                <option value="properties">Most Properties</option>
                <option value="agents">Most Agents</option>
                <option value="years">Most Experienced</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Agencies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {filter === 'myAgency' ? 'Your Agency' : 
               filter === 'featured' ? 'Featured Agencies' : 
               'Top Agencies'}
            </h2>
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-primary">{agencies.length}</span> agencies
            </div>
          </div>
          
          {agencies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <TrophyIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.max(...agencies.map(a => a.totalProperties || 0))}
                    </div>
                    <div className="text-sm text-gray-600">Most Properties</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <UsersIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.max(...agencies.map(a => a.totalAgents || 0))}
                    </div>
                    <div className="text-sm text-gray-600">Most Agents</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <CalendarIcon className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.max(...agencies.map(a => a.yearsInBusiness || 0))}
                    </div>
                    <div className="text-sm text-gray-600">Most Experience</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl border-2 border-red-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-bold text-red-900 mb-3">Unable to Load Agencies</h3>
            <p className="text-red-700 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchAgencies}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gray-200" />
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              </div>  
            ))}
          </div>
        ) : agencies.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-gray-200 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {filter === 'myAgency' ? 'No Agency Found' : 'No Agencies Yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filter === 'myAgency' 
                ? "You haven't created an agency yet. Start your journey today!"
                : "Be the first to create an agency and showcase your properties!"}
            </p>
            <button
              onClick={handleCreateEnterprise}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all"
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              Create Agency
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Agencies Highlight */}
            {agencies.slice(0, 3).map((agency, index) => (
              <div key={agency._id} className="transform hover:scale-[1.01] transition-transform">
                {renderAgencyCard(agency, index)}
              </div>
            ))}
            
            {/* Remaining Agencies Grid */}
            {agencies.length > 3 && (
              <>
                <div className="my-10">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-6 bg-white text-gray-500 text-sm font-medium">
                        More Agencies
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {agencies.slice(3).map((agency, index) => (
                    renderAgencyCard(agency, index + 3)
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {filter === 'all' && agencies.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Agency?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our network of premier real estate agencies and get featured to thousands of potential clients.
            </p>
            <button
              onClick={handleCreateEnterprise}
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all hover:scale-105"
            >
              <SparklesIcon className="w-5 h-5" />
              Create Your Agency Today
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AgenciesListPage;