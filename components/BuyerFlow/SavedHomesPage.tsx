import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Header from '../shared/Header';
import { Property } from '../../types';
import PropertyCard from './PropertyCard';
import { HeartIcon } from '../../constants';

const SavedHomesPage: React.FC = () => {
  const { state } = useAppContext();
  const { savedHomes } = state;

  // New nested grouping type for Country -> City -> Properties
  type GroupedHomes = Record<string, Record<string, Property[]>>;

  const groupedHomes = savedHomes.reduce((acc: GroupedHomes, property) => {
    const { country, city } = property;
    if (!acc[country]) {
      acc[country] = {};
    }
    if (!acc[country][city]) {
      acc[country][city] = [];
    }
    acc[country][city].push(property);
    return acc;
  }, {});

  return (
    <div className="bg-neutral-50 min-h-screen">
      <Header />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Saved Homes</h1>
            <p className="text-lg text-neutral-600 mt-2">
              Your favorite properties, all in one place.
            </p>
          </div>

          {Object.keys(groupedHomes).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(groupedHomes).map(([country, cities]) => (
                <div key={country}>
                  <h2 className="text-2xl font-bold text-neutral-800 mb-6 pb-2 border-b-2 border-primary">{country}</h2>
                  <div className="space-y-8">
                    {Object.entries(cities).map(([city, properties]) => (
                      <div key={city}>
                        <h3 className="text-xl font-semibold text-neutral-700 mb-4">{city}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {properties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md border">
                <HeartIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800">You haven't saved any homes yet.</h3>
              <p className="text-neutral-500 mt-2">Click the heart icon on any property to save it here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedHomesPage;