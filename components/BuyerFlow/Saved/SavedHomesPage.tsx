import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Property } from '../../types';
import PropertyCard from '../PropertyDisplay/PropertyCard';
import { HeartIcon } from '../../constants';
import ComparisonBar from '../Comparison/ComparisonBar';
import ComparisonModal from '../Comparison/ComparisonModal';
import Toast from '../../shared/Toast';
import PropertyCardSkeleton from '../PropertyDisplay/PropertyCardSkeleton';
import AdvertisementBanner from '../../AdvertisementBanner';
import Footer from '../../shared/Footer';

const SavedPropertiesPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { savedHomes, comparisonList, properties, isAuthenticated, isLoadingUserData } = state;
  const [isComparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ show: true, message, type });
  };

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

  const selectedForComparison = useMemo(() => {
    return comparisonList.map(id => properties.find(p => p.id === id)).filter((p): p is Property => p !== undefined);
  }, [comparisonList, properties]);
  
  const exampleProperties = useMemo(() => properties.slice(0, 4), [properties]);

  const renderContent = () => {
    if (!isAuthenticated) {
        return (
            <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md border">
                <HeartIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-800">Log in to view your saved homes</h3>
                <p className="text-neutral-500 mt-2">Save your favorite properties and access them anytime, anywhere.</p>
                <button
                    onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } })}
                    className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-dark transition-colors"
                >
                    Login / Register
                </button>
            </div>
        );
    }

    if (isLoadingUserData) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <PropertyCardSkeleton key={index} />
                ))}
            </div>
        );
    }
    
    if (Object.keys(groupedHomes).length > 0) {
        return (
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
                            <PropertyCard 
                                key={property.id} 
                                property={property} 
                                showCompareButton={true}
                                showToast={showToast}
                             />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        );
    } else {
        return (
            <>
                <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md border">
                    <HeartIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-neutral-800">You haven't saved any homes yet.</h3>
                  <p className="text-neutral-500 mt-2">Click the heart icon on any property to save it here.</p>
                </div>
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Here are some popular properties</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {exampleProperties.map((property) => (
                            <PropertyCard 
                                key={property.id} 
                                property={property} 
                                showCompareButton={true}
                                showToast={showToast}
                             />
                        ))}
                    </div>
                </div>
            </>
        );
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen flex flex-col">
      <AdvertisementBanner position="top" />
      <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
      />
      <ComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => setComparisonModalOpen(false)}
          properties={selectedForComparison}
      />
      <main className={`py-8 flex-grow ${comparisonList.length > 0 ? 'pb-20' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Saved Properties</h1>
            <p className="text-lg text-neutral-600 mt-2">
              Your favorite properties, all in one place.
            </p>
          </div>
          {renderContent()}
        </div>
      </main>
      {comparisonList.length > 0 && (
          <ComparisonBar
              properties={selectedForComparison}
              onCompareNow={() => setComparisonModalOpen(true)}
              onRemove={(id) => dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: id })}
              onClear={() => dispatch({ type: 'CLEAR_COMPARISON' })}
          />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SavedPropertiesPage;