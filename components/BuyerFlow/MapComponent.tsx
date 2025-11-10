// FIX: Add minimal google.maps type declarations to fix build errors
declare namespace google.maps {
  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  export class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }
  
  export class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  export class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    width: number;
    height: number;
  }

  export interface Icon {
    url: string;
    scaledSize?: google.maps.Size;
    anchor?: google.maps.Point;
  }

  export class Map {
    getBounds(): google.maps.LatLngBounds | null | undefined;
    panTo(latLng: google.maps.LatLng | google.maps.LatLngLiteral): void;
    setZoom(zoom: number): void;
  }
  
  export interface LatLngBoundsLiteral {
    north: number;
    south: number;
    east: number;
    west: number;
  }

  export class LatLngBounds {
    constructor(sw?: google.maps.LatLng | google.maps.LatLngLiteral, ne?: google.maps.LatLng | google.maps.LatLngLiteral);
    toJSON(): google.maps.LatLngBoundsLiteral;
  }
  
  export interface MapOptions {
    mapId?: string;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    minZoom?: number;
    maxZoom?: number;
    mapTypeId?: string;
    gestureHandling?: string;
  }
}

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Property } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { SpinnerIcon } from '../../constants';


const TILE_LAYERS = {
  street: 'roadmap',
  satellite: 'satellite',
};

type TileLayerType = keyof typeof TILE_LAYERS;

interface MapComponentProps {
  properties: Property[];
  onMapMove: (bounds: google.maps.LatLngBoundsLiteral) => void;
  userLocation: [number, number] | null;
  mapBoundsJSON: string | null;
  tileLayer: TileLayerType;
  recenterTo: [number, number] | null;
  onRecenterComplete: () => void;
}

const formatMarkerPrice = (price: number): string => {
    if (price >= 1000000) {
        return `€${(price / 1000000).toFixed(1).replace('.0', '')}M`;
    }
    if (price >= 1000) {
        return `€${Math.round(price / 1000)}K`;
    }
    return `€${price}`;
};

const PROPERTY_TYPE_COLORS: Record<NonNullable<Property['propertyType']> | 'other', string> = {
    house: '#0252CD',
    apartment: '#28a745',
    villa: '#6f42c1',
    other: '#6c757d',
};

const createPriceTagIcon = (property: Property): google.maps.Icon => {
    const price = formatMarkerPrice(property.price);
    const color = PROPERTY_TYPE_COLORS[property.propertyType] || PROPERTY_TYPE_COLORS.other;

    const svg = `
      <svg width="70" height="30" viewBox="0 0 70 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 0 H60 C65.5228 0 70 4.47715 70 10 V20 C70 25.5228 65.5228 30 60 30 H10 L0 15 L10 0 Z" fill="${color}"/>
        <text x="38" y="16" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
      </svg>
    `;
    
    return {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        scaledSize: new google.maps.Size(70, 30),
        anchor: new google.maps.Point(0, 15),
    };
};

const MapComponent: React.FC<MapComponentProps> = ({ properties, onMapMove, userLocation, mapBoundsJSON, tileLayer, recenterTo, onRecenterComplete }) => {
    const { state, dispatch } = useAppContext();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.API_KEY,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [activeMarker, setActiveMarker] = useState<string | null>(null);

    const validProperties = useMemo(() => {
        return properties.filter(p => p.lat != null && !isNaN(p.lat) && p.lng != null && !isNaN(p.lng));
    }, [properties]);
    
    const initialCenter = useMemo(() => {
        if (userLocation) return { lat: userLocation[0], lng: userLocation[1] };
        return { lat: 44.2, lng: 19.9 }; // Default Balkan center
    }, [userLocation]);

    const onLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onIdle = useCallback(() => {
        if (map) {
            const bounds = map.getBounds();
            if (bounds) {
                const boundsLiteral = bounds.toJSON();
                if (boundsLiteral) {
                    onMapMove(boundsLiteral);
                }
            }
        }
    }, [map, onMapMove]);

    useEffect(() => {
        if (map && recenterTo) {
            map.panTo({ lat: recenterTo[0], lng: recenterTo[1] });
            map.setZoom(14);
            onRecenterComplete();
        }
    }, [map, recenterTo, onRecenterComplete]);
    
    const handlePopupClick = (propertyId: string) => {
        dispatch({ type: 'SET_SELECTED_PROPERTY', payload: propertyId });
    };
    
    if (!isLoaded) return <div className="w-full h-full flex items-center justify-center bg-neutral-200"><SpinnerIcon className="w-12 h-12 text-primary" /></div>;

    const mapOptions: google.maps.MapOptions = {
        mapId: 'balkan_estate_map',
        disableDefaultUI: true,
        zoomControl: true,
        minZoom: 7,
        maxZoom: 18,
        mapTypeId: TILE_LAYERS[tileLayer],
    };

    return (
        <div className="w-full h-full relative">
            <GoogleMap
                mapContainerClassName="w-full h-full"
                center={initialCenter}
                zoom={7}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onIdle={onIdle}
                options={mapOptions}
            >
                {validProperties.map(prop => (
                    <MarkerF
                        key={prop.id}
                        position={{ lat: prop.lat, lng: prop.lng }}
                        icon={createPriceTagIcon(prop)}
                        onClick={() => setActiveMarker(prop.id)}
                    />
                ))}
                
                {activeMarker && (() => {
                    const prop = validProperties.find(p => p.id === activeMarker);
                    if (!prop) return null;
                    return (
                         <InfoWindowF
                            position={{ lat: prop.lat, lng: prop.lng }}
                            onCloseClick={() => setActiveMarker(null)}
                            options={{ pixelOffset: new google.maps.Size(35, 0) }}
                        >
                            <div className="w-48 cursor-pointer" onClick={() => handlePopupClick(prop.id)}>
                                <img src={prop.imageUrl} alt={prop.address} className="w-full h-24 object-cover rounded-md mb-2" />
                                <p className="font-bold text-md leading-tight">{formatPrice(prop.price, prop.country)}</p>
                                <p className="text-sm text-neutral-600 truncate">{prop.address}, {prop.city}</p>
                            </div>
                        </InfoWindowF>
                    )
                })()}

            </GoogleMap>
            <div className="absolute left-[620px] lg:left-[720px] xl:left-[820px] bottom-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200">
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
        </div>
    );
};

export default MapComponent;