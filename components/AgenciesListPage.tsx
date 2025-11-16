import React, { useState, useEffect } from 'react';
import { getAgencies } from '../services/apiService';
import { BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, StarIcon } from '../constants';
import { useAppContext } from '../context/AppContext';

interface Agency {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  totalProperties: number;
  totalAgents: number;
  yearsInBusiness?: number;
  isFeatured: boolean;
}

const AgenciesListPage: React.FC = () => {
  const { dispatch } = useAppContext();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured'>('all');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetchAgencies();
  }, [filter, cityFilter]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await getAgencies({
        featured: filter === 'featured' ? true : undefined,
        city: cityFilter || undefined,
        limit: 50,
      });
      setAgencies(response.agencies || []);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnterprise = () => {
    // Open the enterprise creation modal
    dispatch({ type: 'TOGGLE_ENTERPRISE_MODAL', payload: true });
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { label: '🥇 #1', color: 'bg-yellow-500 text-white' };
    if (index === 1) return { label: '🥈 #2', color: 'bg-gray-400 text-white' };
    if (index === 2) return { label: '🥉 #3', color: 'bg-orange-600 text-white' };
    return { label: `#${index + 1}`, color: 'bg-neutral-200 text-neutral-700' };
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Top Real Estate Agencies</h1>
          <p className="text-xl text-white/90 mb-6">
            Discover the best real estate agencies in the Balkans
          </p>

          {/* Create Enterprise Button */}
          <button
            onClick={handleCreateEnterprise}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all hover:scale-105"
          >
            <BuildingOfficeIcon className="w-5 h-5 inline-block mr-2" />
            Create Your Enterprise Agency
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All Agencies
            </button>
            <button
              onClick={() => setFilter('featured')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'featured'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <StarIcon className="w-4 h-4 inline-block mr-1" />
              Featured
            </button>
          </div>

          <input
            type="text"
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Agencies List */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : agencies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BuildingOfficeIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-700 mb-2">No agencies found</h3>
            <p className="text-neutral-600">Try adjusting your filters or be the first to create an enterprise agency!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agencies.map((agency, index) => {
              const rank = getRankBadge(index);
              return (
                <div
                  key={agency._id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden ${
                    agency.isFeatured ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Logo/Image Section */}
                    <div className="md:w-64 h-48 bg-gradient-to-br from-primary/10 to-primary-dark/10 flex items-center justify-center relative">
                      {agency.logo ? (
                        <img
                          src={agency.logo}
                          alt={agency.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BuildingOfficeIcon className="w-24 h-24 text-primary/30" />
                      )}

                      {/* Rank Badge */}
                      <div className={`absolute top-4 left-4 ${rank.color} px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
                        {rank.label}
                      </div>

                      {/* Featured Badge */}
                      {agency.isFeatured && (
                        <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          ⭐ Featured
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <h2 className="text-2xl font-bold text-neutral-800 mb-2">{agency.name}</h2>

                      {agency.description && (
                        <p className="text-neutral-600 mb-4 line-clamp-2">{agency.description}</p>
                      )}

                      {/* Stats */}
                      <div className="flex flex-wrap gap-6 mb-4">
                        <div>
                          <span className="text-2xl font-bold text-primary">{agency.totalProperties}</span>
                          <span className="text-sm text-neutral-600 ml-2">Properties</span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-primary">{agency.totalAgents}</span>
                          <span className="text-sm text-neutral-600 ml-2">Agents</span>
                        </div>
                        {agency.yearsInBusiness && (
                          <div>
                            <span className="text-2xl font-bold text-primary">{agency.yearsInBusiness}</span>
                            <span className="text-sm text-neutral-600 ml-2">Years</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-neutral-700">
                        {agency.city && (
                          <div className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{agency.city}{agency.country ? `, ${agency.country}` : ''}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <PhoneIcon className="w-4 h-4" />
                          <a href={`tel:${agency.phone}`} className="hover:text-primary">{agency.phone}</a>
                        </div>
                        <div className="flex items-center gap-1">
                          <EnvelopeIcon className="w-4 h-4" />
                          <a href={`mailto:${agency.email}`} className="hover:text-primary">{agency.email}</a>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
                        View Agency Details
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
