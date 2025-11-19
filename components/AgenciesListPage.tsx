import React, { useState, useEffect } from 'react';
import { getAgencies } from '../services/apiService';
import { BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, StarIcon, SearchIcon } from '../constants';
import { useAppContext } from '../context/AppContext';
import AgenciesMap from './AgenciesMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Agency {
  _id: string;
  slug?: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  address?: string;
  lat?: number;
  lng?: number;
  totalProperties: number;
  totalAgents: number;
  yearsInBusiness?: number;
  isFeatured: boolean;
}

const AgenciesListPage: React.FC = () => {
  const { dispatch, state } = useAppContext();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'featured' | 'myAgency'>('all');
  const [cityFilter, setCityFilter] = useState('');

  const currentUser = state.currentUser;
  const hasAgency = currentUser?.role === 'agent' && currentUser?.agencyId;

  useEffect(() => {
    fetchAgencies();
  }, [filter, cityFilter]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching agencies with filter:', filter, 'cityFilter:', cityFilter);

      // If viewing "My Agency", fetch only the user's agency
      if (filter === 'myAgency' && currentUser?.agencyId) {
        console.log('📍 Fetching user agency:', currentUser.agencyId);
        const response = await fetch(`${API_URL}/agencies/${currentUser.agencyId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('balkan_estate_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('✅ User agency fetched:', data.agency);
          setAgencies([data.agency]);
        } else {
          console.error('❌ Failed to fetch agency:', response.status, response.statusText);
          setError(`Failed to load agency (${response.status})`);
          setAgencies([]);
        }
      } else {
        console.log('📍 Fetching all agencies from API...');
        const response = await getAgencies({
          featured: filter === 'featured' ? true : undefined,
          city: cityFilter || undefined,
          limit: 50,
        });

        console.log('📦 API Response:', response);

        // Use real agencies from the database
        const fetchedAgencies = response.agencies || [];
        console.log(`✅ Fetched ${fetchedAgencies.length} agencies`);

        if (fetchedAgencies.length > 0) {
          console.log('First agency:', fetchedAgencies[0]);
        }

        setAgencies(fetchedAgencies);
      }
    } catch (error) {
      console.error('❌ Failed to fetch agencies:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));

      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Backend server is not running. Please start the backend server.');
      } else {
        setError(`Error loading agencies: ${errorMessage}`);
      }
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  const getMockAgencies = (): Agency[] => {
    return [
      {
        _id: 'mock1',
        slug: 'belgrade-premier-estates',
        name: 'Belgrade Premier Estates',
        description: 'Leading real estate agency in Serbia with over 15 years of experience. Specializing in luxury properties and commercial real estate.',
        logo: 'https://ui-avatars.com/api/?name=Belgrade+Premier&background=0D8ABC&color=fff&size=200',
        email: 'info@belgradepremier.rs',
        phone: '+381 11 123 4567',
        city: 'Belgrade',
        country: 'Serbia',
        address: 'Knez Mihailova 12, Belgrade',
        lat: 44.8176,
        lng: 20.4568,
        totalProperties: 87,
        totalAgents: 12,
        yearsInBusiness: 15,
        isFeatured: true,
      },
      {
        _id: 'mock2',
        slug: 'adriatic-properties-group',
        name: 'Adriatic Properties Group',
        description: 'Premium coastal real estate specialists covering the entire Croatian coastline. Your gateway to Mediterranean living.',
        logo: 'https://ui-avatars.com/api/?name=Adriatic+Properties&background=1e40af&color=fff&size=200',
        email: 'contact@adriaticproperties.hr',
        phone: '+385 21 456 789',
        city: 'Split',
        country: 'Croatia',
        address: 'Riva 5, Split',
        lat: 43.5081,
        lng: 16.4402,
        totalProperties: 124,
        totalAgents: 18,
        yearsInBusiness: 10,
        isFeatured: true,
      },
      {
        _id: 'mock3',
        slug: 'sofia-real-estate-partners',
        name: 'Sofia Real Estate Partners',
        description: 'Bulgaria\'s most trusted real estate agency. Experts in residential, commercial, and investment properties.',
        logo: 'https://ui-avatars.com/api/?name=Sofia+Real+Estate&background=059669&color=fff&size=200',
        email: 'hello@sofiapartners.bg',
        phone: '+359 2 987 6543',
        city: 'Sofia',
        country: 'Bulgaria',
        address: 'Vitosha Boulevard 42, Sofia',
        lat: 42.6977,
        lng: 23.3219,
        totalProperties: 96,
        totalAgents: 15,
        yearsInBusiness: 8,
        isFeatured: true,
      },
      {
        _id: 'mock4',
        slug: 'montenegro-luxury-living',
        name: 'Montenegro Luxury Living',
        description: 'Exclusive properties along the Montenegrin Riviera. Specializing in high-end villas and waterfront estates.',
        logo: 'https://ui-avatars.com/api/?name=Montenegro+Luxury&background=7c3aed&color=fff&size=200',
        email: 'info@montenegroluxury.me',
        phone: '+382 20 123 456',
        city: 'Budva',
        country: 'Montenegro',
        address: 'Slovenska Obala 10, Budva',
        lat: 42.2864,
        lng: 18.8403,
        totalProperties: 45,
        totalAgents: 8,
        yearsInBusiness: 6,
        isFeatured: false,
      },
      {
        _id: 'mock5',
        slug: 'sarajevo-homes-estates',
        name: 'Sarajevo Homes & Estates',
        description: 'Your trusted partner for finding the perfect home in Bosnia and Herzegovina. Family-owned since 2005.',
        logo: 'https://ui-avatars.com/api/?name=Sarajevo+Homes&background=dc2626&color=fff&size=200',
        email: 'contact@sarajevohomes.ba',
        phone: '+387 33 654 321',
        city: 'Sarajevo',
        country: 'Bosnia and Herzegovina',
        address: 'Ferhadija 15, Sarajevo',
        lat: 43.8564,
        lng: 18.4131,
        totalProperties: 62,
        totalAgents: 10,
        yearsInBusiness: 18,
        isFeatured: false,
      },
    ];
  };

  const handleCreateEnterprise = () => {
    dispatch({ type: 'TOGGLE_ENTERPRISE_MODAL', payload: true });
  };

  const handleViewAgency = (agency: Agency) => {
    console.log('🔍 Viewing agency:', agency.name, '(ID:', agency._id, ')');

    // Pass the full agency object to avoid unnecessary API calls
    dispatch({ type: 'SET_SELECTED_AGENCY', payload: agency });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'agencyDetail' });

    // Update browser URL - convert old comma format to new forward slash format
    let urlSlug = agency.slug || agency._id;
    // Replace comma with forward slash for backward compatibility with old slugs
    urlSlug = urlSlug.replace(',', '/');
    window.history.pushState({}, '', `/agencies/${urlSlug}`);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { label: '1', icon: '🏆', color: 'from-yellow-400 to-yellow-600' };
    if (index === 1) return { label: '2', icon: '🥈', color: 'from-gray-300 to-gray-500' };
    if (index === 2) return { label: '3', icon: '🥉', color: 'from-orange-400 to-orange-600' };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section - Apple Style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-gray-900 mb-4">
              Premium Agencies
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Discover the finest real estate agencies across the Balkans
            </p>

            <button
              onClick={handleCreateEnterprise}
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-900 transition-all hover:scale-105 shadow-lg"
            >
              <BuildingOfficeIcon className="w-5 h-5" />
              Create Enterprise Agency
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Agencies
              </button>
              <button
                onClick={() => setFilter('featured')}
                className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-1 ${
                  filter === 'featured'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <StarIcon className="w-4 h-4" />
                Featured
              </button>
              {hasAgency && (
                <button
                  onClick={() => setFilter('myAgency')}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all flex items-center gap-1 ${
                    filter === 'myAgency'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BuildingOfficeIcon className="w-4 h-4" />
                  My Agency
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agencies List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {error ? (
          <div className="bg-red-50 rounded-2xl shadow-sm border-2 border-red-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Failed to Load Agencies</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => fetchAgencies()}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-all"
            >
              Try Again
            </button>
            <div className="mt-6 text-left max-w-2xl mx-auto bg-white border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Troubleshooting:</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Make sure the backend server is running on port 5001</li>
                <li>Check MongoDB is running and accessible</li>
                <li>Verify VITE_API_URL in your .env file</li>
                <li>Check browser console for detailed error messages</li>
              </ul>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-900 border-t-transparent"></div>
          </div>
        ) : agencies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No agencies found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' && !cityFilter
                ? 'No agencies are registered yet. Be the first to create an enterprise agency!'
                : 'Try adjusting your filters or search criteria'}
            </p>
            {filter === 'all' && !cityFilter && (
              <button
                onClick={handleCreateEnterprise}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-all mt-4"
              >
                <BuildingOfficeIcon className="w-5 h-5" />
                Create Enterprise Agency
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {agencies.map((agency, index) => {
              const rank = getRankBadge(index);
              return (
                <div
                  key={agency._id}
                  onClick={() => handleViewAgency(agency)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Logo Section */}
                    <div className="lg:w-80 h-64 lg:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                      {agency.logo ? (
                        <img
                          src={agency.logo}
                          alt={agency.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BuildingOfficeIcon className="w-24 h-24 text-gray-400" />
                      )}

                      {/* Rank Badge */}
                      {rank && (
                        <div className={`absolute top-4 left-4 bg-gradient-to-r ${rank.color} text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2`}>
                          <span className="text-2xl">{rank.icon}</span>
                          <span className="text-lg">#{rank.label}</span>
                        </div>
                      )}

                      {/* Featured Badge */}
                      {agency.isFeatured && (
                        <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-1">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-8">
                      <h2 className="text-3xl font-semibold text-gray-900 mb-3">{agency.name}</h2>

                      {agency.description && (
                        <p className="text-gray-600 mb-6 leading-relaxed">{agency.description}</p>
                      )}

                      {/* Stats */}
                      <div className="flex flex-wrap gap-8 mb-6">
                        <div>
                          <span className="text-3xl font-bold text-gray-900">{agency.totalProperties}</span>
                          <span className="text-sm text-gray-500 ml-2">Properties</span>
                        </div>
                        <div>
                          <span className="text-3xl font-bold text-gray-900">{agency.totalAgents}</span>
                          <span className="text-sm text-gray-500 ml-2">Agents</span>
                        </div>
                        {agency.yearsInBusiness && (
                          <div>
                            <span className="text-3xl font-bold text-gray-900">{agency.yearsInBusiness}</span>
                            <span className="text-sm text-gray-500 ml-2">Years</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                        {agency.city && (
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="w-5 h-5 text-gray-400" />
                            <span>{agency.city}, {agency.country}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-5 h-5 text-gray-400" />
                          <a href={`tel:${agency.phone}`} className="hover:text-gray-900">{agency.phone}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                          <a href={`mailto:${agency.email}`} className="hover:text-gray-900">{agency.email}</a>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all">
                        View Agency
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgenciesListPage;
