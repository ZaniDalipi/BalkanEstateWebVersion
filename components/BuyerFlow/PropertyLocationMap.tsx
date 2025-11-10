// FIX: Add minimal google.maps type declarations to fix build errors
declare namespace google.maps {
  export interface MapOptions {
    disableDefaultUI?: boolean;
    gestureHandling?: string;
    zoomControl?: boolean;
  }
}

import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

interface PropertyLocationMapProps {
    lat: number;
    lng: number;
    address: string;
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({ lat, lng, address }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'property-location-map-script',
        googleMapsApiKey: process.env.API_KEY,
    });
    
    if (isNaN(lat) || isNaN(lng)) {
        return <div className="h-full bg-neutral-200 flex items-center justify-center text-neutral-500">Location data unavailable.</div>;
    }

    if (!isLoaded) return <div className="h-full bg-neutral-200" />;

    const center = { lat, lng };
    const mapOptions: google.maps.MapOptions = {
        disableDefaultUI: true,
        gestureHandling: 'none',
        zoomControl: false,
    };

    return (
        <GoogleMap
            mapContainerClassName="w-full h-full rounded-lg"
            center={center}
            zoom={15}
            options={mapOptions}
        >
            <MarkerF position={center} />
        </GoogleMap>
    );
};

export default PropertyLocationMap;