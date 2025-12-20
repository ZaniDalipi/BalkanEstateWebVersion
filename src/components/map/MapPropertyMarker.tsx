// MapPropertyMarker
// Property markers and popups for map display with clustering support

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Property } from '../../../types';
import { formatPrice } from '../../../utils/currency';

const ZOOM_THRESHOLD = 12;

const PROPERTY_TYPE_COLORS: Record<
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
const createSimpleMarkerIcon = (property: Property, isHovered: boolean = false) => {
  const price = formatMarkerPrice(property.price);
  const color = PROPERTY_TYPE_COLORS[property.propertyType] || PROPERTY_TYPE_COLORS.other;

  // Check if property is actively promoted
  const isActivelyPromoted = property.isPromoted &&
    property.promotionEndDate &&
    property.promotionEndDate > Date.now();

  // Get ring color based on promotion tier or property type
  let ringColor = 'none';
  let ringWidth = 2;
  if (isActivelyPromoted) {
    if (property.promotionTier === 'premium') {
      ringColor = '#c084fc'; // purple-400
    } else if (property.promotionTier === 'highlight') {
      ringColor = '#fbbf24'; // amber-400
    } else if (property.promotionTier === 'featured') {
      ringColor = '#60a5fa'; // blue-400
    } else {
      ringColor = '#9ca3af'; // gray-400
    }
    ringWidth = isHovered ? 4 : 3;
  } else if (isHovered) {
    ringColor = color; // Use property type color on hover
    ringWidth = 4;
  }

  const svgHtml = `
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3)); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">
            <circle cx="15" cy="15" r="${13 + (isHovered ? 3 : 0)}" fill="${color}" stroke="${ringColor !== 'none' ? ringColor : '#FFFFFF'}" stroke-width="${ringWidth}"/>
            <text x="15" y="16" font-family="Inter, sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;

  return L.divIcon({
    html: svgHtml,
    className: isHovered ? 'scale-150 drop-shadow-lg' : '',
    iconSize: [30, 30],
    iconAnchor: [15, isHovered ? 5 : 15],
    popupAnchor: [0, -15],
  });
};

/**
 * Create detailed house-shaped marker for zoomed in view
 */
const createDetailedMarkerIcon = (property: Property, isHovered: boolean = false) => {
  const price = formatMarkerPrice(property.price);
  const color = PROPERTY_TYPE_COLORS[property.propertyType] || PROPERTY_TYPE_COLORS.other;

  // Check if property is actively promoted
  const isActivelyPromoted = property.isPromoted &&
    property.promotionEndDate &&
    property.promotionEndDate > Date.now();

  // Get stroke color based on promotion tier or property type
  let strokeColor = '#FFFFFF';
  let strokeWidth = 2;
  if (isActivelyPromoted) {
    if (property.promotionTier === 'premium') {
      strokeColor = '#c084fc'; // purple-400
    } else if (property.promotionTier === 'highlight') {
      strokeColor = '#fbbf24'; // amber-400
    } else if (property.promotionTier === 'featured') {
      strokeColor = '#60a5fa'; // blue-400
    } else {
      strokeColor = '#9ca3af'; // gray-400
    }
    strokeWidth = isHovered ? 4 : 3;
  } else if (isHovered) {
    strokeColor = color; // Use property type color on hover
    strokeWidth = 4;
  }

  const scale = isHovered ? 1.25 : 1;
  const svgHtml = `
        <svg width="45" height="36" viewBox="0 0 70 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4)); transform-origin: bottom center; transform: scale(${scale}); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
            <path d="M35 56L25 44H45L35 56Z" fill="#003A96" />
            <path d="M65 24.5V44H5V24.5L35 5L65 24.5Z" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
            <text x="35" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;

  return L.divIcon({
    html: svgHtml,
    className: isHovered ? 'drop-shadow-xl' : '',
    iconSize: [45, 36],
    iconAnchor: [22.5, isHovered ? 20 : 36],
    popupAnchor: [0, -36],
  });
};

/**
 * Create appropriate marker icon based on zoom level
 */
const createCustomMarkerIcon = (property: Property, zoom: number, isHovered: boolean = false): L.DivIcon => {
  if (zoom < ZOOM_THRESHOLD) {
    return createSimpleMarkerIcon(property, isHovered);
  }
  return createDetailedMarkerIcon(property, isHovered);
};

/**
 * Create cluster icon with count and styling
 */
const createClusterIcon = (cluster: L.MarkerCluster): L.DivIcon => {
  const count = cluster.getChildCount();

  // Determine size and color based on count
  let size = 40;
  let bgColor = '#0252CD';
  let fontSize = 12;

  if (count >= 100) {
    size = 55;
    bgColor = '#6f42c1'; // purple for large clusters
    fontSize = 14;
  } else if (count >= 50) {
    size = 50;
    bgColor = '#c084fc'; // lighter purple
    fontSize = 13;
  } else if (count >= 20) {
    size = 45;
    bgColor = '#28a745'; // green
    fontSize = 12;
  }

  const svgHtml = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 8px rgba(0,0,0,0.35));">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${bgColor}" stroke="#FFFFFF" stroke-width="3"/>
      <text x="${size/2}" y="${size/2 + 1}" font-family="Inter, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${count}</text>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'marker-cluster-custom',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
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

      {/* Title */}
      {property.title && (
        <p className="font-bold text-sm text-neutral-900 mb-1 line-clamp-1">
          {property.title}
        </p>
      )}

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
 * Clustered Markers Component
 *
 * Renders all property markers on the map with clustering for better performance.
 * Uses Leaflet.markercluster for efficient rendering of large numbers of markers.
 */
interface MarkersProps {
  properties: Property[];
  onPopupClick: (id: string) => void;
  hoveredPropertyId?: string | null;
}

export const Markers: React.FC<MarkersProps> = ({ properties, onPopupClick, hoveredPropertyId }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const prevPropertyIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  // Create stable property map for quick lookups
  const propertyMap = useMemo(() => {
    const map = new Map<string, Property>();
    properties.forEach(p => map.set(p.id, p));
    return map;
  }, [properties]);

  // Initialize cluster group once
  useEffect(() => {
    if (isInitializedRef.current) return;

    clusterGroupRef.current = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 100,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 60,
      disableClusteringAtZoom: 16,
      animate: true,
      animateAddingMarkers: false,
      iconCreateFunction: createClusterIcon,
      removeOutsideVisibleBounds: true,
      spiderLegPolylineOptions: { weight: 1.5, color: '#0252CD', opacity: 0.5 },
    });
    map.addLayer(clusterGroupRef.current);
    isInitializedRef.current = true;

    return () => {
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
        isInitializedRef.current = false;
      }
      markersRef.current.clear();
      prevPropertyIdsRef.current.clear();
    };
  }, [map]);

  // Create popup content
  const createPopupContent = useCallback((property: Property): HTMLElement => {
    const container = document.createElement('div');
    container.className = 'property-popup-container';
    container.innerHTML = `
      <div class="w-56 cursor-pointer" data-property-id="${property.id}">
        <div class="relative mb-2">
          <img src="${property.images?.[0]?.url || property.imageUrl}" alt="${property.address}" class="w-full h-28 object-cover rounded" onerror="this.src='https://via.placeholder.com/224x112?text=No+Image'" />
        </div>
        ${property.title ? `<p class="font-bold text-sm text-neutral-900 mb-1 line-clamp-1">${property.title}</p>` : ''}
        <div class="mb-1.5">
          <div class="flex items-center justify-between">
            <p class="font-bold text-base" style="color: #0252CD;">${formatPrice(property.price, property.country)}</p>
            <span class="text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 capitalize">${property.propertyType}</span>
          </div>
        </div>
        <p class="text-xs text-neutral-600 mb-2 line-clamp-1">${property.address}, ${property.city}</p>
        <div class="grid grid-cols-3 gap-1.5 mb-2 text-center">
          <div class="bg-neutral-50 rounded py-1.5">
            <div class="text-xs text-neutral-500">Beds</div>
            <div class="font-bold text-sm text-neutral-800">${property.beds}</div>
          </div>
          <div class="bg-neutral-50 rounded py-1.5">
            <div class="text-xs text-neutral-500">Baths</div>
            <div class="font-bold text-sm text-neutral-800">${property.baths}</div>
          </div>
          <div class="bg-neutral-50 rounded py-1.5">
            <div class="text-xs text-neutral-500">m²</div>
            <div class="font-bold text-sm text-neutral-800">${property.sqft}</div>
          </div>
        </div>
        <div class="text-center pt-1.5 border-t border-neutral-200">
          <p class="text-xs font-semibold" style="color: #0252CD;">Click for details →</p>
        </div>
      </div>
    `;

    container.addEventListener('click', () => {
      onPopupClick(property.id);
    });

    return container;
  }, [onPopupClick]);

  // Sync markers with properties - only add/remove when needed
  useEffect(() => {
    if (!clusterGroupRef.current || !isInitializedRef.current) return;

    const clusterGroup = clusterGroupRef.current;
    const currentMarkers = markersRef.current;
    const prevIds = prevPropertyIdsRef.current;
    const currentIds = new Set(properties.map(p => p.id));

    // Find markers to remove (in prev but not in current)
    const toRemove: string[] = [];
    prevIds.forEach(id => {
      if (!currentIds.has(id)) {
        toRemove.push(id);
      }
    });

    // Find properties to add (in current but not in prev)
    const toAdd: Property[] = [];
    properties.forEach(prop => {
      if (!prevIds.has(prop.id)) {
        toAdd.push(prop);
      }
    });

    // Batch remove markers
    if (toRemove.length > 0) {
      const markersToRemove: L.Marker[] = [];
      toRemove.forEach(id => {
        const marker = currentMarkers.get(id);
        if (marker) {
          markersToRemove.push(marker);
          currentMarkers.delete(id);
        }
      });
      if (markersToRemove.length > 0) {
        clusterGroup.removeLayers(markersToRemove);
      }
    }

    // Batch add new markers
    if (toAdd.length > 0) {
      const newMarkers: L.Marker[] = [];
      toAdd.forEach(property => {
        const marker = L.marker([property.lat, property.lng], {
          icon: createCustomMarkerIcon(property, zoom, false),
        });

        const popupContent = createPopupContent(property);
        marker.bindPopup(popupContent, { maxWidth: 230, minWidth: 220 });

        // Store property reference
        (marker as any)._propertyId = property.id;

        currentMarkers.set(property.id, marker);
        newMarkers.push(marker);
      });

      clusterGroup.addLayers(newMarkers);
    }

    // Update previous IDs reference
    prevPropertyIdsRef.current = currentIds;
  }, [properties, zoom, createPopupContent]);

  // Handle zoom changes - update all marker icons
  useEffect(() => {
    const currentMarkers = markersRef.current;

    currentMarkers.forEach((marker, id) => {
      const property = propertyMap.get(id);
      if (property) {
        const isHovered = id === hoveredPropertyId;
        marker.setIcon(createCustomMarkerIcon(property, zoom, isHovered));
      }
    });
  }, [zoom, propertyMap, hoveredPropertyId]);

  // Handle hover state changes - only update affected markers
  useEffect(() => {
    const currentMarkers = markersRef.current;

    // Update only the hovered marker and previously hovered marker
    currentMarkers.forEach((marker, id) => {
      const property = propertyMap.get(id);
      if (property) {
        const isHovered = id === hoveredPropertyId;
        marker.setIcon(createCustomMarkerIcon(property, zoom, isHovered));

        // Adjust z-index for hovered marker
        if (isHovered && clusterGroupRef.current) {
          const visibleMarker = clusterGroupRef.current.getVisibleParent(marker);
          if (visibleMarker === marker) {
            marker.setZIndexOffset(1000);
          }
        } else {
          marker.setZIndexOffset(0);
        }
      }
    });
  }, [hoveredPropertyId, propertyMap, zoom]);

  return null; // Rendering is handled imperatively via Leaflet
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
