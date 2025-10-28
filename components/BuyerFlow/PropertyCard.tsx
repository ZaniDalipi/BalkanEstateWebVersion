

import React from 'react';
import { Property } from '../../types';
import { MapPinIcon, BedIcon, BathIcon, SqftIcon } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { dispatch } = useAppContext();

  const handleCardClick = () => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property });
  };

  const handleViewPlansClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_PRICING_MODAL', payload: true });
  }

  return (
    <button 
      onClick={handleCardClick}
      className="bg-white rounded-lg overflow-hidden shadow-md border border-neutral-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full"
    >
      <div className="relative">
        <img src={property.imageUrl} alt={property.address} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-500 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
      </div>
      <div className="p-4">
        <div>
            <p className="text-2xl font-bold text-neutral-900">{formatPrice(property.price, property.country)}</p>
            <div className="flex items-center text-neutral-600 mt-1">
                <MapPinIcon className="w-4 h-4 mr-1.5 text-neutral-400 flex-shrink-0" />
                <span className="truncate">{property.address}, {property.city}</span>
            </div>
        </div>
        <div className="mt-4 flex justify-between text-sm text-neutral-800 border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-2">
            <BedIcon className="w-5 h-5 text-primary" />
            <span><span className="font-bold">{property.beds}</span> bds</span>
          </div>
           <div className="flex items-center gap-2">
            <BathIcon className="w-5 h-5 text-primary" />
            <span><span className="font-bold">{property.baths}</span> ba</span>
          </div>
           <div className="flex items-center gap-2">
            <SqftIcon className="w-5 h-5 text-primary" />
            <span><span className="font-bold">{property.sqft}</span> m²</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
             <button
                onClick={handleViewPlansClick}
                className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
            >
                View Plans
            </button>
        </div>
      </div>
    </button>
  );
};

export default PropertyCard;