/**
 * Cadastre/Parcel Layer Configuration for Balkan Countries
 *
 * This configuration provides WMS endpoints for cadastral data across Balkan countries.
 * WMS (Web Map Service) is used instead of WFS to minimize data transfer -
 * WMS delivers pre-rendered tiles while WFS would transfer raw vector data.
 */

export interface CadastreLayerConfig {
  country: string;
  countryCode: string;
  enabled: boolean;
  wmsUrl: string;
  layers: string;
  format?: string;
  version?: string;
  transparent?: boolean;
  attribution?: string;
  maxZoom?: number;
  minZoom?: number;
  // Bounds for the country [south, west, north, east]
  bounds?: [[number, number], [number, number]];
  // Additional WMS parameters
  additionalParams?: Record<string, string>;
  // Notes about the service
  notes?: string;
}

export const CADASTRE_LAYERS: Record<string, CadastreLayerConfig> = {
  AL: {
    country: 'Albania',
    countryCode: 'AL',
    enabled: true,
    wmsUrl: 'https://geoportal.asig.gov.al/service',
    layers: 'Cadastre:parcels', // Layer name may need adjustment
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'ASIG - Agency for Spatial Information (Albania)',
    minZoom: 16,
    bounds: [[39.6, 19.3], [42.7, 21.1]],
    notes: 'Albania National Geoportal - ASIG. May require API key or specific layer names.',
  },

  MK: {
    country: 'North Macedonia',
    countryCode: 'MK',
    enabled: true,
    wmsUrl: 'https://katastar.gov.mk/geoserver/wms',
    layers: 'cadastre:parcels',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Agency for Real Estate Cadastre (North Macedonia)',
    minZoom: 16,
    bounds: [[40.8, 20.5], [42.4, 23.0]],
    notes: 'North Macedonia Cadastre Agency. Contact agency for API access details.',
  },

  GR: {
    country: 'Greece',
    countryCode: 'GR',
    enabled: true,
    wmsUrl: 'https://gis.ktimanet.gr/wms',
    layers: 'CP.CadastralParcel',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Hellenic Cadastre (Ktimatologio)',
    minZoom: 16,
    bounds: [[34.8, 19.4], [41.7, 28.2]],
    additionalParams: {
      'CRS': 'EPSG:4326',
    },
    notes: 'Greek Cadastre - INSPIRE compliant WMS service. Layer name: CP.CadastralParcel',
  },

  BG: {
    country: 'Bulgaria',
    countryCode: 'BG',
    enabled: true,
    wmsUrl: 'https://kais.cadastre.bg/geoserver/wms',
    layers: 'cadastre:parcels',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'KAIS - Cadastral Geoportal (Bulgaria)',
    minZoom: 16,
    bounds: [[41.2, 22.4], [44.2, 28.6]],
    notes: 'Bulgaria Cadastre Portal - INSPIRE catalogue available.',
  },

  XK: {
    country: 'Kosovo',
    countryCode: 'XK',
    enabled: true,
    wmsUrl: 'https://geoportal.rks-gov.net/wms',
    layers: 'cadastre:parcels',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Kosovo Cadastral Agency (AKK)',
    minZoom: 16,
    bounds: [[41.8, 20.0], [43.3, 21.8]],
    notes: 'Kosovo Geoportal - May require API key from AKK.',
  },

  RO: {
    country: 'Romania',
    countryCode: 'RO',
    enabled: true,
    wmsUrl: 'https://geoportal.ancpi.ro/arcgis/services/cadastru/MapServer/WMSServer',
    layers: '0', // Parcels layer - typically layer 0 in ANCPI services
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'ANCPI - National Agency for Cadastre (Romania)',
    minZoom: 16,
    bounds: [[43.6, 20.3], [48.3, 29.7]],
    additionalParams: {
      'CRS': 'EPSG:4326',
    },
    notes: 'Romania ANCPI - Good REST/WMS support. Layer 0 is typically cadastral parcels.',
  },

  BA: {
    country: 'Bosnia & Herzegovina',
    countryCode: 'BA',
    enabled: true,
    wmsUrl: 'https://katastar.ba/geoserver/wms',
    layers: 'cadastre:parcels',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Federal Geodetic Administration (Bosnia & Herzegovina)',
    minZoom: 16,
    bounds: [[42.5, 15.7], [45.3, 19.6]],
    notes: 'Coverage varies by entity/municipality. May need federation-specific endpoints.',
  },

  HR: {
    country: 'Croatia',
    countryCode: 'HR',
    enabled: true,
    wmsUrl: 'https://oss.uredjenazemlja.hr/wms',
    layers: 'DOF5:katastarske_cestice',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'State Geodetic Administration - NIPP Geoportal (Croatia)',
    minZoom: 16,
    bounds: [[42.4, 13.5], [46.5, 19.4]],
    additionalParams: {
      'CRS': 'EPSG:4326',
    },
    notes: 'Croatia DGU - NIPP Geoportal. May require API access request.',
  },

  RS: {
    country: 'Serbia',
    countryCode: 'RS',
    enabled: true,
    wmsUrl: 'https://a3.geosrbija.rs/arcgis/services/OpenData/Katastar/MapServer/WMSServer',
    layers: '0', // Cadastral parcels layer
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Republic Geodetic Authority - Geosrbija (Serbia)',
    minZoom: 16,
    bounds: [[42.2, 18.8], [46.2, 23.0]],
    notes: 'Serbia RGZ - Geosrbija portal. ArcGIS MapServer service.',
  },

  ME: {
    country: 'Montenegro',
    countryCode: 'ME',
    enabled: true,
    wmsUrl: 'https://ekatastar.space.gov.me/geoserver/wms',
    layers: 'cadastre:parcels',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Real Estate Administration - eKatastar (Montenegro)',
    minZoom: 16,
    bounds: [[41.8, 18.4], [43.6, 20.4]],
    notes: 'Montenegro eKatastar - Public geoportal with cadastral services.',
  },

  SI: {
    country: 'Slovenia',
    countryCode: 'SI',
    enabled: true,
    wmsUrl: 'https://prostor.gov.si/ows/wms',
    layers: 'cp.cadastralparcels.cadastralparcel',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'GURS - eProstor (Slovenia)',
    minZoom: 16,
    bounds: [[45.4, 13.4], [46.9, 16.6]],
    additionalParams: {
      'CRS': 'EPSG:4326',
    },
    notes: 'Slovenia GURS - eProstor with public data APIs. INSPIRE compliant.',
  },
};

/**
 * Minimum zoom level to show cadastre layers (to minimize data usage)
 */
export const CADASTRE_MIN_ZOOM = 16;

/**
 * Get cadastre layer config for a specific country
 */
export function getCadastreLayerForCountry(countryCode: string): CadastreLayerConfig | undefined {
  return CADASTRE_LAYERS[countryCode.toUpperCase()];
}

/**
 * Get all enabled cadastre layers
 */
export function getEnabledCadastreLayers(): CadastreLayerConfig[] {
  return Object.values(CADASTRE_LAYERS).filter(layer => layer.enabled);
}

/**
 * Check if a country has cadastre layer available
 */
export function hasCadastreLayer(countryCode: string): boolean {
  const layer = getCadastreLayerForCountry(countryCode);
  return layer !== undefined && layer.enabled;
}

/**
 * Determine which country's cadastre layer to show based on map center
 */
export function getCadastreLayerForLocation(lat: number, lng: number): CadastreLayerConfig | undefined {
  for (const layer of Object.values(CADASTRE_LAYERS)) {
    if (!layer.enabled || !layer.bounds) continue;

    const [[south, west], [north, east]] = layer.bounds;
    if (lat >= south && lat <= north && lng >= west && lng <= east) {
      return layer;
    }
  }

  return undefined;
}
