import React, { useState, useCallback, memo } from 'react';
import { Property } from '../../../types';
import { MapPinIcon, BedIcon, BathIcon, SqftIcon, UserCircleIcon, ScaleIcon, LivingRoomIcon, BuildingOfficeIcon } from '../../../constants';
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
  const [isHovered, setIsHovered] = useState(false);
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
    window.history.pushState({ propertyId: property.id }, '', `/property/${property.id}`);
  }, [dispatch, property.id]);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
      e.stopPropagation();
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

  // Property type labels
  const propertyTypeLabel = {
    apartment: 'Apartment',
    house: 'House',
    villa: 'Villa',
    land: 'Land',
    commercial: 'Commercial',
  }[property.propertyType] || 'Property';

  // Determine card styles based on promotion tier
  const getCardStyles = () => {
    if (isSold) return 'border-neutral-300 opacity-80';
    if (isActivelyPromoted) {
      if (promotionTier === 'premium') return 'ring-2 ring-purple-400 border-purple-200 shadow-purple-100';
      if (promotionTier === 'highlight') return 'ring-2 ring-amber-400 border-amber-200 shadow-amber-100';
      if (promotionTier === 'featured') return 'ring-2 ring-blue-400 border-blue-200 shadow-blue-100';
      return 'ring-1 ring-gray-400 border-gray-200';
    }
    return 'border-neutral-200 hover:border-primary/30';
  };

  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden shadow-lg border-2 transition-all duration-500 text-left w-full flex flex-col cursor-pointer ${getCardStyles()} ${
        isHovered && !isSold ? 'shadow-2xl -translate-y-2 scale-[1.02]' : 'hover:shadow-xl'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        {imageError ? (
          <div className="w-full h-44 sm:h-48 md:h-52 bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 flex items-center justify-center">
            <BuildingOfficeIcon className="w-12 h-12 text-neutral-400" />
          </div>
        ) : (
          <div className="relative w-full h-44 sm:h-48 md:h-52 overflow-hidden">
            <img
              src={property.imageUrl}
              alt={property.address}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isHovered && !isSold ? 'scale-110' : 'scale-100'
              } ${isSold ? 'grayscale' : ''}`}
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        {/* Top badges row */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            {/* Sold Badge */}
            {isSold && (
              <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                SOLD
              </div>
            )}

            {/* New Badge */}
            {!isSold && isNew && !isActivelyPromoted && (
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                NEW
              </div>
            )}

            {/* Promotion Badges */}
            {!isSold && isActivelyPromoted && promotionTier && (
              <div className={`text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 ${
                promotionTier === 'premium'
                  ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600'
                  : promotionTier === 'highlight'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500'
                  : promotionTier === 'featured'
                  ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700'
              }`}>
                <span className="text-sm">✨</span>
                {promotionTier === 'premium' && 'PREMIUM'}
                {promotionTier === 'highlight' && 'HIGHLIGHT'}
                {promotionTier === 'featured' && 'FEATURED'}
                {promotionTier === 'standard' && 'PROMOTED'}
              </div>
            )}

            {/* Urgent Badge */}
            {!isSold && isActivelyPromoted && property.hasUrgentBadge && (
              <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-pulse flex items-center gap-1.5">
                <span>🔥</span> URGENT
              </div>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`p-2.5 rounded-full shadow-lg transition-all duration-300 ${
              isFavorited
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/95 backdrop-blur-sm text-neutral-600 hover:bg-red-500 hover:text-white hover:scale-110'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isFavorited ? 'fill-current scale-110' : ''}`} fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Property Type Badge - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-white/95 backdrop-blur-sm text-neutral-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md border border-neutral-200/50">
            {propertyTypeLabel}
          </span>
        </div>

        {/* Price Badge - Bottom Right */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="bg-gradient-to-r from-primary to-primary-dark text-white text-sm sm:text-base font-bold px-4 py-2 rounded-lg shadow-lg">
            {formatPrice(property.price, property.country)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Title */}
        {property.title && (
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {property.title}
          </h3>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-primary/10 rounded-full">
            <MapPinIcon className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm text-neutral-600 truncate font-medium">
            {property.city}, {property.country}
          </span>
        </div>

        {/* Property Stats */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-2 rounded-xl" title={`${property.beds} bedrooms`}>
            <BedIcon className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-neutral-800">{property.beds}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-2 rounded-xl" title={`${property.baths} bathrooms`}>
            <BathIcon className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-neutral-800">{property.baths}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-2 rounded-xl" title={`${property.livingRooms} living rooms`}>
            <LivingRoomIcon className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-neutral-800">{property.livingRooms}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-2 rounded-xl border border-primary/20" title={`${property.sqft} square meters`}>
            <SqftIcon className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-primary">{property.sqft} m²</span>
          </div>
        </div>

        <div className="flex-grow"></div>

        {/* Seller/Agent Info Section */}
        <div className="pt-4 border-t-2 border-neutral-100">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Seller/Agent Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative">
                {property.seller.avatarUrl ? (
                  <img
                    src={property.seller.avatarUrl}
                    alt={property.seller.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shadow-md border-2 border-white">
                    <UserCircleIcon className="w-6 h-6 text-primary" />
                  </div>
                )}
                {/* Online indicator dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-800 truncate">{property.seller.name}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  property.seller.type === 'agent'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {property.seller.type === 'agent' ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                      Agent
                    </>
                  ) : (
                    'Private Seller'
                  )}
                </span>
              </div>
            </div>

            {/* Right: Agency Logo & Name (if agent with agency) */}
            {property.seller.type === 'agent' && property.seller.agencyName && (
              <div className="flex items-center gap-2 flex-shrink-0 bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200">
                {property.seller.agencyLogo ? (
                  <img
                    src={property.seller.agencyLogo}
                    alt={property.seller.agencyName}
                    className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border border-neutral-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                    <BuildingOfficeIcon className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="hidden sm:block max-w-[90px]">
                  <p className="text-[10px] text-neutral-500 leading-tight font-medium">Agency</p>
                  <p className="text-xs font-semibold text-neutral-700 truncate">{property.seller.agencyName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Compare Button (if enabled) */}
          {showCompareButton && (
            <button
              onClick={handleCompareClick}
              className={`mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 w-full ${
                isInComparison
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30'
              }`}
            >
              <ScaleIcon className="w-5 h-5" />
              <span>{isInComparison ? 'Remove from Compare' : 'Add to Compare'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(PropertyCard);
