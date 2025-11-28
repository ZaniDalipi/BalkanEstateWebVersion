import React, { useState, useCallback, memo } from 'react';
import { Property } from '../../types';
import { MapPinIcon, BedIcon, BathIcon, SqftIcon, UserCircleIcon, ScaleIcon, LivingRoomIcon, BuildingOfficeIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';

interface PropertyCardProps {
  property: Property;
  showToast?: (message: string, type: 'success' | 'error') => void;
  showCompareButton?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, showToast, showCompareButton }) => {
  const { state, dispatch, toggleSavedHome } = useAppContext();
  const [imageError, setImageError] = useState(false);
  const isFavorited = state.savedHomes.some(p => p.id === property.id);
  const isInComparison = state.comparisonList.includes(property.id);
  const isNew = property.createdAt && (Date.now() - property.createdAt < 3 * 24 * 60 * 60 * 1000);
  const isSold = property.status === 'sold';

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property.id });
    // Update browser history to enable back button navigation (web & mobile)
    window.history.pushState({ propertyId: property.id }, '', `/property/${property.id}`);
  }, [dispatch, property.id]);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      if (!state.isAuthenticated && !state.user) {
          dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
      } else {
          try {
              await toggleSavedHome(property);
          } catch (error) {
              console.error('Failed to toggle saved home:', error);
              showToast?.('Failed to save property. Please try again.', 'error');
          }
      }
  }, [state.isAuthenticated, state.user, dispatch, property, toggleSavedHome, showToast]);

  const handleCompareClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      if (isInComparison) {
          dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: property.id });
      } else {
          if (state.comparisonList.length < 5) {
              dispatch({ type: 'ADD_TO_COMPARISON', payload: property.id });
          } else {
              showToast?.("You can compare a maximum of 5 properties.", 'error');
          }
      }
  }, [isInComparison, dispatch, property.id, state.comparisonList.length, showToast]);

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-lg border border-neutral-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left w-full flex flex-col ${
        isSold ? 'opacity-75 grayscale-[50%]' : ''
      }`}
    >
      <div className="block w-full relative">
        <button onClick={handleCardClick} className="block w-full">
            {imageError ? (
                <div className="w-full h-56 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-16 h-16 text-neutral-400" />
                </div>
            ) : (
                <img 
                  src={property.imageUrl} 
                  alt={property.address} 
                  className="w-full h-56 object-cover" 
                  onError={() => setImageError(true)} 
                />
            )}
        </button>
        {isSold && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg z-10">
                SOLD
            </div>
        )}
        {!isSold && isNew && (
            <div className="absolute top-3 left-3 bg-secondary text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
                NEW
            </div>
        )}
        <div onClick={handleFavoriteClick} className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full cursor-pointer hover:bg-white hover:scale-110 transition-transform duration-200 z-10">
             <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 transition-colors duration-300 ${isFavorited ? 'text-red-500 fill-current' : 'text-neutral-500 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <button onClick={handleCardClick} className="text-left flex-grow">
            <div className="flex items-center text-neutral-600 mb-2">
                <MapPinIcon className="w-5 h-5 mr-2 text-neutral-400 flex-shrink-0" />
                <span className="truncate text-base font-medium">{property.address}, {property.city}</span>
            </div>
            <p className="text-3xl font-bold text-neutral-900 my-3">{formatPrice(property.price, property.country)}</p>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-neutral-700 mb-3">
                <div className="flex items-center gap-2" title={`${property.beds} bedrooms`}>
                    <BedIcon className="w-6 h-6 text-neutral-500" />
                    <span className="font-semibold text-base">{property.beds}</span>
                </div>
                <div className="flex items-center gap-2" title={`${property.baths} bathrooms`}>
                    <BathIcon className="w-6 h-6 text-neutral-500" />
                    <span className="font-semibold text-base">{property.baths}</span>
                </div>
                <div className="flex items-center gap-2" title={`${property.livingRooms} living rooms`}>
                    <LivingRoomIcon className="w-6 h-6 text-neutral-500" />
                    <span className="font-semibold text-base">{property.livingRooms}</span>
                </div>
                <div className="flex items-center gap-2" title={`${property.sqft} square meters`}>
                    <SqftIcon className="w-6 h-6 text-neutral-500" />
                    <span className="font-semibold text-base">{property.sqft} m²</span>
                </div>
            </div>
        </button>

        <div className="flex-grow"></div>

        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            {showCompareButton && (
                <button
                    onClick={handleCompareClick}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full text-base font-semibold transition-all shadow-sm hover:shadow-md w-full sm:w-auto ${
                        isInComparison
                            ? 'bg-primary-light text-primary-dark border-2 border-primary/50'
                            : 'bg-white text-neutral-700 border-2 border-neutral-300 hover:bg-neutral-100'
                    }`}
                >
                    <ScaleIcon className="w-6 h-6" />
                    <span>{isInComparison ? 'Selected' : 'Compare'}</span>
                </button>
            )}
             <button
                onClick={handleCardClick}
                className="bg-primary text-white px-5 py-3 rounded-full text-base font-semibold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
            >
                {property.seller.avatarUrl ? (
                    <img src={property.seller.avatarUrl} alt={property.seller.name} className="w-7 h-7 rounded-full object-cover border-2 border-white/50" />
                ) : (
                    <UserCircleIcon className="w-7 h-7" />
                )}
                <span>View Details</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default memo(PropertyCard);