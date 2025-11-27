import React, { useState, useEffect } from 'react';
import { getFeaturedAgencies } from '../services/apiService';
import { BuildingOfficeIcon, ArrowRightIcon } from '../constants';

interface FeaturedAgenciesProps {
  limit?: number;
}

const FeaturedAgencies: React.FC<FeaturedAgenciesProps> = ({ limit = 3 }) => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedAgencies = async () => {
      try {
        setLoading(true);
        const response = await getFeaturedAgencies(limit);
        setAgencies(response.agencies || []);
      } catch (err) {
        console.error('Failed to load featured agencies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAgencies();
  }, [limit]);

  if (loading || agencies.length === 0) {
    return null; // Don't show anything while loading or if no featured agencies
  }

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Featured Real Estate Agencies</h2>
          <p className="text-white/90 text-sm md:text-base">Premium agencies trusted by thousands of clients</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <div
              key={agency._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer transform hover:-translate-y-1 transition-transform"
            >
              {/* Agency Logo/Cover */}
              {agency.coverImage || agency.logo ? (
                <div className="h-40 md:h-48 bg-neutral-200 relative overflow-hidden">
                  <img
                    src={agency.coverImage || agency.logo}
                    alt={agency.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 md:h-48 bg-gradient-to-br from-primary/20 to-primary-dark/20 flex items-center justify-center">
                  <BuildingOfficeIcon className="w-16 h-16 md:w-24 md:h-24 text-primary/40" />
                </div>
              )}

              {/* Agency Info */}
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  {agency.logo && !agency.coverImage && (
                    <img
                      src={agency.logo}
                      alt={agency.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary flex-shrink-0"
                    />
                  )}
                  <h3 className="text-lg md:text-xl font-bold text-neutral-800">{agency.name}</h3>
                </div>

                {agency.description && (
                  <p className="text-neutral-600 text-xs md:text-sm line-clamp-2 mb-3 md:mb-4">{agency.description}</p>
                )}

                {/* Stats */}
                <div className="flex gap-3 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm">
                  <div>
                    <span className="font-bold text-primary">{agency.totalProperties || 0}</span>
                    <span className="text-neutral-600 ml-1">Properties</span>
                  </div>
                  <div>
                    <span className="font-bold text-primary">{agency.totalAgents || 0}</span>
                    <span className="text-neutral-600 ml-1">Agents</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t pt-3 md:pt-4 space-y-1 md:space-y-2">
                  {agency.phone && (
                    <p className="text-xs md:text-sm text-neutral-700">
                      <span className="font-semibold hidden sm:inline">Phone:</span> {agency.phone}
                    </p>
                  )}
                  {agency.email && (
                    <p className="text-xs md:text-sm text-neutral-700">
                      <span className="font-semibold hidden sm:inline">Email:</span> {agency.email}
                    </p>
                  )}
                </div>

                {/* View Agency Button */}
                <button className="mt-3 md:mt-4 w-full bg-primary text-white py-2 px-3 md:px-4 rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  View Agency
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedAgencies;
