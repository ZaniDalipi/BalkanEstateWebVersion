// MapPropertyMarker
// Property markers and popups for map display

import React, { useState } from 'react';
import { Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '../../../types';
import { formatPrice } from '../../../utils/currency';

const ZOOM_THRESHOLD = 12;

export const PROPERTY_TYPE_COLORS: Record<
  NonNullable<Property['propertyType']> | 'other',
  string
> = {
  house: '#0252CD',
  apartment: '#28a745',
  villa: '#6f42c1',
  other: '#6c757d',
};

/**
 * Format price for marker display (short format)
 */
const formatMarkerPrice = (price: number): string => {
  if (price >= 1000000) {
    return `€${(price / 1000000).toFixed(1).replace('.0', '')}M`;
  }
  if (price >= 1000) {
    return `€${Math.round(price / 1000)}K`;
  }
  return `€${price}`;
};

/**
 * Create simple circular marker for zoomed out view
 */
const createSimpleMarkerIcon = (property: Property) => {
  const price = formatMarkerPrice(property.price);
  const color = PROPERTY_TYPE_COLORS[property.propertyType] || PROPERTY_TYPE_COLORS.other;

  const svgHtml = `
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
            <circle cx="15" cy="15" r="13" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
            <text x="15" y="16" font-family="Inter, sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;

  return L.divIcon({
    html: svgHtml,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

/**
 * Create detailed house-shaped marker for zoomed in view
 */
const createDetailedMarkerIcon = (property: Property) => {
  const price = formatMarkerPrice(property.price);
  const color = PROPERTY_TYPE_COLORS[property.propertyType] || PROPERTY_TYPE_COLORS.other;

  const svgHtml = `
        <svg width="45" height="36" viewBox="0 0 70 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3)); transform-origin: bottom center;">
            <path d="M35 56L25 44H45L35 56Z" fill="#003A96" />
            <path d="M65 24.5V44H5V24.5L35 5L65 24.5Z" fill="${color}" stroke="#FFFFFF" stroke-width="2" />
            <text x="35" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;

  return L.divIcon({
    html: svgHtml,
    className: '',
    iconSize: [45, 36],
    iconAnchor: [22.5, 36],
    popupAnchor: [0, -36],
  });
};

/**
 * Create appropriate marker icon based on zoom level
 */
const createCustomMarkerIcon = (property: Property, zoom: number): L.DivIcon => {
  if (zoom < ZOOM_THRESHOLD) {
    return createSimpleMarkerIcon(property);
  }
  return createDetailedMarkerIcon(property);
};

/**
 * PropertyPopup Component
 *
 * Displays property information in map popup with image carousel.
 */
const PropertyPopup: React.FC<{
  property: Property;
  onPopupClick: (id: string) => void;
}> = ({ property, onPopupClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    property.images && property.images.length > 0
      ? property.images.map((img) => img.url)
      : [property.imageUrl];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="w-56 cursor-pointer" onClick={() => onPopupClick(property.id)}>
      {/* Image carousel */}
      <div className="relative mb-2">
        <img
          src={images[currentImageIndex]}
          alt={property.address}
          className="w-full h-28 object-cover rounded"
        />

        {/* Image navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors text-sm"
            >
              ‹
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors text-sm"
            >
              ›
            </button>

            {/* Image counter */}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {currentImageIndex + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {/* Price and property type */}
      <div className="mb-1.5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-base text-primary">
            {formatPrice(property.price, property.country)}
          </p>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 capitalize">
            {property.propertyType}
          </span>
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-neutral-600 mb-2 line-clamp-1">
        {property.address}, {property.city}
      </p>

      {/* Essential information */}
      <div className="grid grid-cols-3 gap-1.5 mb-2 text-center">
        <div className="bg-neutral-50 rounded py-1.5">
          <div className="text-xs text-neutral-500">Beds</div>
          <div className="font-bold text-sm text-neutral-800">{property.beds}</div>
        </div>
        <div className="bg-neutral-50 rounded py-1.5">
          <div className="text-xs text-neutral-500">Baths</div>
          <div className="font-bold text-sm text-neutral-800">{property.baths}</div>
        </div>
        <div className="bg-neutral-50 rounded py-1.5">
          <div className="text-xs text-neutral-500">m²</div>
          <div className="font-bold text-sm text-neutral-800">{property.sqft}</div>
        </div>
      </div>

      {/* Additional features */}
      <div className="flex flex-wrap gap-1 mb-1.5">
        {property.livingRooms > 0 && (
          <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
            {property.livingRooms} Living
          </span>
        )}
        {property.parking > 0 && (
          <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
            {property.parking} Parking
          </span>
        )}
        {property.yearBuilt && (
          <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
            {property.yearBuilt}
          </span>
        )}
      </div>

      {/* View details prompt */}
      <div className="text-center pt-1.5 border-t border-neutral-200">
        <p className="text-xs font-semibold text-primary">Click for details →</p>
      </div>
    </div>
  );
};

/**
 * Markers Component
 *
 * Renders all property markers on the map with zoom-responsive icons.
 */
interface MarkersProps {
  properties: Property[];
  onPopupClick: (id: string) => void;
}

export const Markers: React.FC<MarkersProps> = ({ properties, onPopupClick }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  return (
    <>
      {properties.map((prop) => (
        <Marker
          key={prop.id}
          position={[prop.lat, prop.lng]}
          icon={createCustomMarkerIcon(prop, zoom)}
        >
          <Popup maxWidth={230} minWidth={220}>
            <PropertyPopup property={prop} onPopupClick={onPopupClick} />
          </Popup>
        </Marker>
      ))}
    </>
  );
};

/**
 * Legend Component
 *
 * Shows color legend for different property types.
 */
export const Legend: React.FC = () => (
  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200 animate-fade-in">
    <h4 className="font-bold text-sm mb-2 text-neutral-800">Legend</h4>
    <div className="space-y-1.5">
      {Object.entries(PROPERTY_TYPE_COLORS).map(([type, color]) => (
        <div key={type} className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color }}
          ></span>
          <span className="text-xs font-semibold text-neutral-700 capitalize">{type}</span>
        </div>
      ))}
    </div>
  </div>
);
