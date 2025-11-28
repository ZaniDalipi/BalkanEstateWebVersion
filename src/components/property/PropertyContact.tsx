// PropertyContact Component
// Seller contact sidebar with calculators

import React from 'react';
import { Property } from '@/types';
import { PhoneIcon, UserCircleIcon } from 'lucide-react';
import MortgageCalculator from '@/components/BuyerFlow/MortgageCalculator';
import RentVsBuyCalculator from '@/components/BuyerFlow/RentVsBuyCalculator';

interface PropertyContactProps {
  property: Property;
  isCreatingConversation: boolean;
  onContactSeller: () => void;
}

/**
 * PropertyContact Component
 *
 * Sticky sidebar for contacting the seller and financial calculators:
 * - Seller information and avatar
 * - Call seller button
 * - Message seller button
 * - Mortgage calculator
 * - Rent vs buy calculator
 *
 * Usage:
 * ```tsx
 * <PropertyContact
 *   property={property}
 *   isCreatingConversation={isCreating}
 *   onContactSeller={handleContact}
 * />
 * ```
 */
export const PropertyContact: React.FC<PropertyContactProps> = ({
  property,
  isCreatingConversation,
  onContactSeller,
}) => {
  return (
    <div className="sticky top-24 space-y-6">
      {/* Contact Seller Card */}
      <div className="bg-white p-4 rounded-xl shadow-lg border border-neutral-200">
        <h3 className="text-base sm:text-lg font-bold text-neutral-800 mb-4">Contact Seller</h3>

        {/* Seller Info */}
        <div className="flex items-center gap-4 mb-4">
          {property.seller?.avatarUrl ? (
            <img
              src={property.seller.avatarUrl}
              alt={property.seller.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="w-12 h-12 text-neutral-300" />
          )}
          <div>
            <p className="font-bold text-base text-neutral-900">{property.seller?.name}</p>
            <p className="text-xs text-neutral-600 capitalize">{property.seller?.type}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {property.status === 'sold' ? (
            <div className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-neutral-300 rounded-lg shadow-sm text-sm font-medium text-neutral-400 bg-neutral-100 cursor-not-allowed">
              <PhoneIcon className="w-4 h-4" />
              Property Sold
            </div>
          ) : (
            <a
              href={`tel:${property.seller?.phone}`}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
            >
              <PhoneIcon className="w-4 h-4" />
              Call Seller
            </a>
          )}
          <button
            onClick={onContactSeller}
            disabled={isCreatingConversation || property.status === 'sold'}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-primary text-primary rounded-lg shadow-sm text-sm font-medium bg-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingConversation
              ? 'Starting Chat...'
              : property.status === 'sold'
              ? 'Property Sold'
              : 'Message Seller'}
          </button>
        </div>
      </div>

      {/* Mortgage Calculator */}
      <MortgageCalculator propertyPrice={property.price} country={property.country} />

      {/* Rent vs Buy Calculator */}
      <RentVsBuyCalculator propertyPrice={property.price} country={property.country} />
    </div>
  );
};
