import React, { useState, useEffect } from 'react';
import { getFeaturedCities, CityMarketData } from '../../services/apiService';
import { formatPrice } from '../../utils/currency';
import { MapPinIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon, CalendarIcon, HomeIcon, SparklesIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';

const CityRecommendations: React.FC = () => {
  const [cities, setCities] = useState<CityMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const { dispatch, updateSearchPageState } = useAppContext();

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setLoading(true);
      const data = await getFeaturedCities(36); // Load 36 cities (3-4 per country)
      setCities(data);
    } catch (error) {
      console.error('Failed to load featured cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = selectedCountry === 'all'
    ? cities
    : cities.filter(c => c.country === selectedCountry);

  const countries = Array.from(new Set(cities.map(c => c.country))).sort();

  const handleCityClick = (city: CityMarketData) => {
    // Set filters to search for properties in this city
    updateSearchPageState({
      filters: {
        country: city.countryCode,
        query: city.city, // Use query field to search by city name
        minPrice: null,
        maxPrice: null,
        beds: null,
        baths: null,
        livingRooms: null,
        minSqft: null,
        maxSqft: null,
        sortBy: 'newest',
        sellerType: 'any',
        propertyType: 'any',
        minYearBuilt: null,
        maxYearBuilt: null,
        minParking: null,
        furnishing: 'any',
        heatingType: 'any',
        condition: 'any',
        viewType: 'any',
        energyRating: 'any',
        hasBalcony: null,
        hasGarden: null,
        hasElevator: null,
        hasSecurity: null,
        hasAirConditioning: null,
        hasPool: null,
        petsAllowed: null,
        minFloorNumber: null,
        maxFloorNumber: null,
        maxDistanceToCenter: null,
        maxDistanceToSea: null,
        maxDistanceToSchool: null,
        maxDistanceToHospital: null,
        amenities: [],
      },
      activeFilters: {
        country: city.countryCode,
        query: city.city, // Use query field to search by city name
        minPrice: null,
        maxPrice: null,
        beds: null,
        baths: null,
        livingRooms: null,
        minSqft: null,
        maxSqft: null,
        sortBy: 'newest',
        sellerType: 'any',
        propertyType: 'any',
        minYearBuilt: null,
        maxYearBuilt: null,
        minParking: null,
        furnishing: 'any',
        heatingType: 'any',
        condition: 'any',
        viewType: 'any',
        energyRating: 'any',
        hasBalcony: null,
        hasGarden: null,
        hasElevator: null,
        hasSecurity: null,
        hasAirConditioning: null,
        hasPool: null,
        petsAllowed: null,
        minFloorNumber: null,
        maxFloorNumber: null,
        maxDistanceToCenter: null,
        maxDistanceToSea: null,
        maxDistanceToSchool: null,
        maxDistanceToHospital: null,
        amenities: [],
      },
    });
    dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'search' });
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    } else if (trend === 'declining') {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
    }
    return <ChartBarIcon className="w-4 h-4 text-neutral-500" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'rising') return 'text-green-600 bg-green-50';
    if (trend === 'declining') return 'text-red-600 bg-red-50';
    return 'text-neutral-600 bg-neutral-50';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-neutral-900">Explore Cities</h2>
          </div>
          <p className="text-neutral-600 mb-8">Discover the best real estate markets across the Balkans</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-full"></div>
                  <div className="h-4 bg-neutral-200 rounded w-full"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto text-center">
          <HomeIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-700 mb-2">No City Data Available</h3>
          <p className="text-neutral-500">Market data will be updated soon. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="w-8 h-8 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">Explore Cities</h2>
          </div>
          <p className="text-neutral-600 text-sm sm:text-base">
            Discover the best real estate markets across the Balkans with AI-powered market insights
          </p>
        </div>

        {/* Country Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCountry('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCountry === 'all'
                ? 'bg-primary text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All Countries ({cities.length})
          </button>
          {countries.map(country => {
            const count = cities.filter(c => c.country === country).length;
            return (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCountry === country
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {country} ({count})
              </button>
            );
          })}
        </div>

        {/* City Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => (
            <button
              key={city._id}
              onClick={() => handleCityClick(city)}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-xl hover:border-primary transition-all duration-300 text-left group"
            >
              {/* City Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPinIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary transition-colors">
                      {city.city}
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-500">{city.country}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getTrendColor(city.marketTrend)}`}>
                  {getTrendIcon(city.marketTrend)}
                  {city.marketTrend}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Avg. Price/m²</span>
                  <span className="text-base font-bold text-neutral-900">
                    €{city.avgPricePerSqm.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Median Price</span>
                  <span className="text-base font-semibold text-neutral-900">
                    {formatPrice(city.medianPrice, city.countryCode)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">YoY Growth</span>
                  <span className={`text-base font-semibold ${
                    city.priceGrowthYoY > 0 ? 'text-green-600' : city.priceGrowthYoY < 0 ? 'text-red-600' : 'text-neutral-600'
                  }`}>
                    {city.priceGrowthYoY > 0 ? '+' : ''}{city.priceGrowthYoY}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Rental Yield</span>
                  <span className="text-base font-semibold text-primary">
                    {city.rentalYield}%
                  </span>
                </div>
              </div>

              {/* Highlights */}
              {city.highlights && city.highlights.length > 0 && (
                <div className="border-t border-neutral-100 pt-4">
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Highlights</h4>
                  <ul className="space-y-1">
                    {city.highlights.slice(0, 2).map((highlight, idx) => (
                      <li key={idx} className="text-sm text-neutral-700 flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="flex-1">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stats Footer */}
              <div className="border-t border-neutral-100 pt-4 mt-4 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <HomeIcon className="w-4 h-4" />
                  <span>{city.listingsCount} listings</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{city.averageDaysOnMarket} days avg.</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Data Freshness Note */}
        {cities.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-xs text-neutral-500">
              Market data is updated twice monthly using AI-powered analysis.
              Last updated: {new Date(cities[0].lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityRecommendations;
