/// <reference types="vite/client" />
/// <reference types="leaflet.markercluster" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_FACEBOOK_APP_ID?: string;
  readonly VITE_APPLE_CLIENT_ID?: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend Leaflet namespace for MarkerCluster
declare module 'leaflet' {
  interface MarkerCluster extends L.Marker {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    spiderfy(): void;
    unspiderfy(): void;
  }

  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    chunkInterval?: number;
    chunkDelay?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    maxClusterRadius?: number | ((zoom: number) => number);
    disableClusteringAtZoom?: number;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    iconCreateFunction?: (cluster: MarkerCluster) => L.Icon | L.DivIcon;
    removeOutsideVisibleBounds?: boolean;
    spiderLegPolylineOptions?: L.PolylineOptions;
    singleMarkerMode?: boolean;
    spiderfyDistanceMultiplier?: number;
    polygonOptions?: L.PolylineOptions;
  }

  interface MarkerClusterGroup extends L.FeatureGroup {
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    addLayers(layers: L.Layer[]): this;
    removeLayers(layers: L.Layer[]): this;
    clearLayers(): this;
    getVisibleParent(marker: L.Marker): L.Marker | MarkerCluster;
    refreshClusters(layers?: L.Layer | L.Layer[]): this;
    hasLayer(layer: L.Layer): boolean;
    zoomToShowLayer(layer: L.Marker, callback?: () => void): void;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
