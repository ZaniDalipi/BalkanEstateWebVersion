import React, { useState, useCallback, memo } from 'react';
import { Property } from '../../../types';
import { MapPinIcon, BedIcon, BathIcon, SqftIcon, UserCircleIcon, ScaleIcon, LivingRoomIcon, BuildingOfficeIcon, EnvelopeIcon } from '../../../constants';
import { useAppContext } from '../../../context/AppContext';
import { formatPrice } from '../../../utils/currency';

interface PropertyCardProps {
  property: Property;
  showToast?: (message: string, type: 'success' | 'error') => void;
  showCompareButton?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, showToast, showCompareButton }) => {
  const { state, dispatch, toggleSavedHome, createConversation } = useAppContext();
  const [imageError, setImageError] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const isFavorited = state.savedHomes.some(p => p.id === property.id);
  const isInComparison = state.comparisonList.includes(property.id);
  const isNew = property.createdAt && (Date.now() - property.createdAt < 3 * 24 * 60 * 60 * 1000);
  const isSold = property.status === 'sold';

  // Check if property has an active promotion
  const isActivelyPromoted = property.isPromoted &&
    property.promotionEndDate &&
    property.promotionEndDate > Date.now();
  const promotionTier = isActivelyPromoted ? property.promotionTier : null;

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

  const handleMessageSeller = useCallback(async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!state.isAuthenticated && !state.user) {
          dispatch({ type: 'TOGGLE_AUTH_MODAL', payload: { isOpen: true } });
          return;
      }

      try {
          setIsCreatingConversation(true);
          const conversation = await createConversation(property.id);
          dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conversation.id });
          // Navigate to inbox
          window.history.pushState({ page: 'inbox' }, '', '/inbox');
          // Trigger a navigation event to update the app routing
          dispatch({ type: 'SET_CURRENT_PAGE', payload: 'inbox' });
      } catch (error) {
          console.error('Failed to create conversation:', error);
          showToast?.('Failed to start conversation. Please try again.', 'error');
      } finally {
          setIsCreatingConversation(false);
      }
  }, [state.isAuthenticated, state.user, dispatch, property.id, createConversation, showToast]);

  // Determine card border/ring style based on promotion tier
  const promotionCardStyle = isActivelyPromoted
    ? promotionTier === 'premium'
      ? 'ring-2 ring-purple-400 border-purple-300'
      : promotionTier === 'highlight'
      ? 'ring-2 ring-amber-400 border-amber-300'
      : promotionTier === 'featured'
      ? 'ring-2 ring-blue-400 border-blue-300'
      : 'ring-1 ring-gray-400 border-gray-300'
    : 'border-neutral-200';

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden shadow-md border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full flex flex-col ${
        isSold ? 'opacity-75 grayscale-[50%]' : ''
      } ${promotionCardStyle}`}
    >
      <div className="block w-full relative">
        <button onClick={handleCardClick} className="block w-full">
            {imageError ? (
                <div className="w-full h-32 sm:h-36 md:h-40 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                    <BuildingOfficeIcon className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" />
                </div>
            ) : (
                <img
                  src={property.imageUrl}
                  alt={property.address}
                  className="w-full h-32 sm:h-36 md:h-40 object-cover"
                  onError={() => setImageError(true)}
                />
            )}
        </button>
        {isSold && (
            <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg z-10">
                SOLD
            </div>
        )}
        {!isSold && isNew && !isActivelyPromoted && (
            <div className="absolute top-1.5 left-1.5 bg-secondary text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-lg z-10">
                NEW
            </div>
        )}
        {/* Promotion Badges */}
        {!isSold && isActivelyPromoted && promotionTier && (
            <div className={`absolute top-1.5 left-1.5 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg z-10 flex items-center gap-1 ${
                promotionTier === 'premium'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700'
                    : promotionTier === 'highlight'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : promotionTier === 'featured'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
            }`}>
                {promotionTier === 'premium' && <span>PREMIUM</span>}
                {promotionTier === 'highlight' && <span>HIGHLIGHT</span>}
                {promotionTier === 'featured' && <span>FEATURED</span>}
                {promotionTier === 'standard' && <span>PROMOTED</span>}
            </div>
        )}
        {!isSold && isActivelyPromoted && property.hasUrgentBadge && (
            <div className="absolute top-10 left-1.5 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-lg z-10 animate-pulse">
                URGENT
            </div>
        )}
        <div onClick={handleFavoriteClick} className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm p-2.5 sm:p-2 rounded-full cursor-pointer hover:bg-white hover:scale-110 transition-transform duration-200 z-10">
             <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 sm:h-4 sm:w-4 transition-colors duration-300 ${isFavorited ? 'text-red-500 fill-current' : 'text-neutral-500 hover:text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
      </div>
      <div className="p-2.5 sm:p-3 md:p-4 flex flex-col flex-grow">
        <button onClick={handleCardClick} className="text-left flex-grow min-w-0">
            <div className="flex items-center text-neutral-600 mb-1 overflow-hidden min-w-0">
                <MapPinIcon className="w-3.5 h-3.5 mr-1 text-neutral-400 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm font-medium">{property.address}, {property.city}</span>
            </div>
            {property.title && (
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-neutral-800 mb-1.5 line-clamp-2">{property.title}</h3>
            )}
            <p className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 my-1.5">{formatPrice(property.price, property.country)}</p>
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2.5 text-neutral-700 mb-1.5">
                <div className="flex items-center gap-1" title={`${property.beds} bedrooms`}>
                    <BedIcon className="w-4 h-4 text-neutral-500" />
                    <span className="font-semibold text-sm">{property.beds}</span>
                </div>
                <div className="flex items-center gap-1" title={`${property.baths} bathrooms`}>
                    <BathIcon className="w-4 h-4 text-neutral-500" />
                    <span className="font-semibold text-sm">{property.baths}</span>
                </div>
                <div className="flex items-center gap-1" title={`${property.livingRooms} living rooms`}>
                    <LivingRoomIcon className="w-4 h-4 text-neutral-500" />
                    <span className="font-semibold text-sm">{property.livingRooms}</span>
                </div>
                <div className="flex items-center gap-1" title={`${property.sqft} square meters`}>
                    <SqftIcon className="w-4 h-4 text-neutral-500" />
                    <span className="font-semibold text-sm">{property.sqft} m²</span>
                </div>
            </div>
        </button>

        <div className="flex-grow"></div>

        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-neutral-100">
            {/* Seller/Agent Info Section */}
            <div className="flex items-center justify-between gap-2 mb-2">
                {/* Left: Seller/Agent Info */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {property.seller.avatarUrl ? (
                        <img
                            src={property.seller.avatarUrl}
                            alt={property.seller.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-neutral-200 flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                            <UserCircleIcon className="w-5 h-5 text-neutral-500" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-neutral-800 truncate">{property.seller.name}</p>
                        <span className={`inline-flex items-center text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded ${
                            property.seller.type === 'agent'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-neutral-100 text-neutral-600'
                        }`}>
                            {property.seller.type === 'agent' ? 'Agent' : 'Private Seller'}
                        </span>
                    </div>
                </div>

                {/* Right: Agency Logo & Name (if agent with agency) */}
                {property.seller.type === 'agent' && property.seller.agencyName && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {property.seller.agencyLogo ? (
                            <img
                                src={property.seller.agencyLogo}
                                alt={property.seller.agencyName}
                                className="w-8 h-8 rounded object-contain border border-neutral-200 bg-white p-0.5"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                                <BuildingOfficeIcon className="w-4 h-4 text-primary" />
                            </div>
                        )}
                        <div className="hidden sm:block max-w-[80px]">
                            <p className="text-[10px] text-neutral-500 leading-tight">Agency</p>
                            <p className="text-xs font-medium text-neutral-700 truncate">{property.seller.agencyName}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Compare Button (if enabled) */}
            {showCompareButton && (
                <button
                    onClick={handleCompareClick}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all shadow-sm hover:shadow-md w-full ${
                        isInComparison
                            ? 'bg-primary-light text-primary-dark border-2 border-primary/50'
                            : 'bg-white text-neutral-700 border-2 border-neutral-300 hover:bg-neutral-100'
                    }`}
                >
                    <ScaleIcon className="w-4 h-4" />
                    <span>{isInComparison ? 'Remove from Compare' : 'Add to Compare'}</span>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default memo(PropertyCard);