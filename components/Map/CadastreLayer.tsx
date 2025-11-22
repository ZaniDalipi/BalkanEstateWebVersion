import React, { useEffect, useState } from 'react';
import { WMSTileLayer, useMap, useMapEvents } from 'react-leaflet';
import { getCadastreLayerForLocation, CADASTRE_MIN_ZOOM, type CadastreLayerConfig } from '../../config/cadastreLayers';

interface CadastreLayerProps {
  /**
   * Whether cadastre layers are enabled/visible
   */
  enabled: boolean;

  /**
   * Opacity of the cadastre layer (0-1)
   */
  opacity?: number;

  /**
   * Override the minimum zoom level
   */
  minZoom?: number;
}

/**
 * CadastreLayer Component
 *
 * Renders WMS cadastral parcel layers from various Balkan country cadastre agencies.
 * The layer is only visible when:
 * - enabled prop is true
 * - zoom level is >= minZoom (default 16)
 * - map is centered over a country with available cadastre data
 *
 * The component automatically detects which country's layer to show based on
 * the map center position and only loads that country's WMS layer to minimize
 * data usage.
 */
export const CadastreLayer: React.FC<CadastreLayerProps> = ({
  enabled,
  opacity = 0.7,
  minZoom = CADASTRE_MIN_ZOOM,
}) => {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const [currentLayer, setCurrentLayer] = useState<CadastreLayerConfig | undefined>(undefined);

  // Track map events to update layer visibility
  useMapEvents({
    zoomend: () => {
      setCurrentZoom(map.getZoom());
    },
    moveend: () => {
      updateCurrentLayer();
    },
  });

  // Update the current cadastre layer based on map center
  const updateCurrentLayer = () => {
    const center = map.getCenter();
    const layer = getCadastreLayerForLocation(center.lat, center.lng);
    setCurrentLayer(layer);
  };

  // Initialize current layer on mount
  useEffect(() => {
    updateCurrentLayer();
  }, []);

  // Don't render if disabled or zoom is too low
  if (!enabled || currentZoom < minZoom || !currentLayer) {
    return null;
  }

  // Build WMS parameters
  const wmsParams: Record<string, any> = {
    layers: currentLayer.layers,
    format: currentLayer.format || 'image/png',
    transparent: currentLayer.transparent !== false,
    version: currentLayer.version || '1.3.0',
    ...currentLayer.additionalParams,
  };

  return (
    <WMSTileLayer
      url={currentLayer.wmsUrl}
      params={wmsParams}
      opacity={opacity}
      attribution={currentLayer.attribution}
      // @ts-ignore - Leaflet types may not include all options
      maxZoom={currentLayer.maxZoom}
      minZoom={currentLayer.minZoom}
    />
  );
};

export default CadastreLayer;
