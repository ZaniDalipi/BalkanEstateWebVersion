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
  const { state, dispatch } = useAppContext();
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

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      if (!state.isAuthenticated && !state.user) {
          dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
      } else {
          dispatch({ type: 'TOGGLE_SAVED_HOME', payload: property });
      }
  }, [state.isAuthenticated, state.user, dispatch, property]);

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
      className={`bg-white rounded-lg overflow-hidden shadow-md border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full flex flex-col ${
        isSold ? 'opacity-75 grayscale-[50%]' : ''
      }`}
    >
      <div className="block w-full relative">
        <button onClick={handleCardClick} className="block w-full">
            {imageError ? (
                <div className="w-full h-40 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-12 h-12 text-neutral-400" />
                </div>
            ) : (
                <img src={property.imageUrl} alt={property.address} className="w-full h-40 object-cover" onError={() => setImageError(true)} />
            )}
        </button>
        {isSold && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg z-10">
                SOLD
            </div>
        )}
        {!isSold && isNew && (
            <div className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md shadow-md z-10">
                NEW
            </div>
        )}
        <div onClick={handleFavoriteClick} className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-white z-10">
             <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-300 ${isFavorited ? 'text-red-500 fill-current' : 'text-neutral-500 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <button onClick={handleCardClick} className="text-left flex-grow">
            <div className="flex items-center text-neutral-600">
                <MapPinIcon className="w-4 h-4 mr-1.5 text-neutral-400 flex-shrink-0" />
                <span className="truncate text-sm">{property.address}, {property.city}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 my-1.5">{formatPrice(property.price, property.country)}</p>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-neutral-700">
                <div className="flex items-center gap-1.5" title={`${property.beds} bedrooms`}>
                    <BedIcon className="w-5 h-5 text-neutral-500" />
                    <span className="font-semibold text-sm">{property.beds}</span>
                </div>
                <div className="flex items-center gap-1.5" title={`${property.baths} bathrooms`}>
                    <BathIcon className="w-5 h-5 text-neutral-500" />
                    <span className="font-semibold text-sm">{property.baths}</span>
                </div>
                <div className="flex items-center gap-1.5" title={`${property.livingRooms} living rooms`}>
                    <LivingRoomIcon className="w-5 h-5 text-neutral-500" />
                    <span className="font-semibold text-sm">{property.livingRooms}</span>
                </div>
                <div className="flex items-center gap-1.5" title={`${property.sqft} square meters`}>
                    <SqftIcon className="w-5 h-5 text-neutral-500" />
                    <span className="font-semibold text-sm">{property.sqft} m²</span>
                </div>
            </div>
        </button>

        <div className="flex-grow"></div> 
        
        <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
            {showCompareButton && (
                <button
                    onClick={handleCompareClick}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm hover:shadow-md w-full sm:w-auto ${
                        isInComparison
                            ? 'bg-primary-light text-primary-dark border border-primary/50'
                            : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                    }`}
                >
                    <ScaleIcon className="w-5 h-5" />
                    <span>{isInComparison ? 'Selected' : 'Compare'}</span>
                </button>
            )}
             <button
                onClick={handleCardClick}
                className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
            >
                {property.seller.avatarUrl ? (
                    <img src={property.seller.avatarUrl} alt={property.seller.name} className="w-6 h-6 rounded-full object-cover border-2 border-white/50" />
                ) : (
                    <UserCircleIcon className="w-6 h-6" />
                )}
                <span>View Details</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default memo(PropertyCard);