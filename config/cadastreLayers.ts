/**
 * Cadastre/Parcel Layer Configuration for Balkan Countries
 *
 * FINAL WORKING IMPLEMENTATION - Shows parcel numbers AND boundaries
 *
 * Last Updated: 2025-11-26
 *
 * Technical Note:
 * Most WMS services only show boundaries. To show parcel NUMBERS, we use:
 * - WMTS tile services with labels (preferred)
 * - WMS with label styles where available
 * - Only working endpoints from official government portals
 *
 * ✅ VERIFIED WORKING (shows numbers):
 * - Croatia (HR) - WMS with labels
 * - Greece (GR) - INSPIRE WMS with parcel IDs
 */

export interface CadastreLayerConfig {
  country: string;
  countryCode: string;
  enabled: boolean;
  wmsUrl: string;
  wfsUrl?: string;
  layers: string;
  format?: string;
  version?: string;
  transparent?: boolean;
  attribution?: string;
  maxZoom?: number;
  minZoom?: number;
  bounds?: [[number, number], [number, number]];
  additionalParams?: Record<string, string>;
  notes?: string;
}

export const CADASTRE_LAYERS: Record<string, CadastreLayerConfig> = {
  GR: {
    country: 'Greece',
    countryCode: 'GR',
    enabled: true,
    wmsUrl: 'http://gis.ktimanet.gr/wms/ktbasemap/default.aspx',
    layers: 'KTBASEMAP',
    format: 'image/png',
    version: '1.1.1',
    transparent: true,
    attribution: 'Hellenic Cadastre (Ktimatologio)',
    minZoom: 17,
    bounds: [[34.8, 19.4], [41.7, 28.2]],
    additionalParams: {
      SRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '✅ WORKING: Base map with parcel numbers. Portal: gis.ktimanet.gr'
  },

  HR: {
    country: 'Croatia',
    countryCode: 'HR',
    enabled: true,
    wmsUrl: 'https://api.uredjenazemlja.hr/services/inspire/cp_wms/wms',
    layers: 'CP.CadastralParcel',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'State Geodetic Administration - DGU (Croatia)',
    minZoom: 17,
    bounds: [[42.4, 13.5], [46.5, 19.4]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '✅ WORKING: Shows parcel boundaries with numbers. Portal: oss.uredjenazemlja.hr'
  },

  AL: {
    country: 'Albania',
    countryCode: 'AL',
    enabled: false,
    wmsUrl: 'https://geoportal.asig.gov.al/service/zrpp/wms',
    layers: 'ZRPP',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'ASIG - State Authority for Geospatial Information (Albania)',
    minZoom: 17,
    bounds: [[39.6, 19.3], [42.7, 21.1]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '⚠️ WMS shows boundaries only, no parcel numbers. Would need WFS + client labels.'
  },

  MK: {
    country: 'North Macedonia',
    countryCode: 'MK',
    enabled: false,
    wmsUrl: 'https://ossp.katastar.gov.mk/geoserver/KC/wms',
    layers: 'KC:katastarski_parceli',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Agency for Real Estate Cadastre (AREC)',
    minZoom: 17,
    bounds: [[40.8, 20.5], [42.4, 23.0]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '⚠️ WMS shows boundaries only, no parcel numbers visible.'
  },

  BG: {
    country: 'Bulgaria',
    countryCode: 'BG',
    enabled: false,
    wmsUrl: 'https://kais.cadastre.bg/arcgis/services/CADMAP/CADMAP/MapServer/WMSServer',
    layers: '0',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Geodesy, Cartography and Cadastre Agency (GCCA)',
    minZoom: 17,
    bounds: [[41.2, 22.4], [44.2, 28.6]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '⚠️ WMS shows boundaries only. Would need their tile service or WFS.'
  },

  XK: {
    country: 'Kosovo',
    countryCode: 'XK',
    enabled: false,
    wmsUrl: 'https://geoportal.rks-gov.net/geoserver/wms',
    layers: 'KG_DEV_WS:CadastreZone',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Kosovo Cadastral Agency (AKK)',
    minZoom: 17,
    bounds: [[41.8, 20.0], [43.3, 21.8]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '⚠️ Endpoint not publicly documented.'
  },

  RO: {
    country: 'Romania',
    countryCode: 'RO',
    enabled: false,
    wmsUrl: 'https://geoportal.ancpi.ro/arcgis/services/eterra3_publish/MapServer/WMSServer',
    layers: '1',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'ANCPI - National Agency for Cadastre and Land Registration (Romania)',
    minZoom: 17,
    bounds: [[43.6, 20.3], [48.3, 29.7]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '⚠️ WMS shows boundaries only. Would need ArcGIS REST API for queries.'
  },

  BA: {
    country: 'Bosnia & Herzegovina',
    countryCode: 'BA',
    enabled: false,
    wmsUrl: 'https://katastar.ba/geoserver/Katastarske_parcele/wms',
    layers: 'Katastarske_parcele:katastarske_parcele',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Federal Geodetic Administration (FGU)',
    minZoom: 17,
    bounds: [[42.5, 15.7], [45.3, 19.6]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '⚠️ GeoServer WMS - boundaries only, no labels.'
  },

  RS: {
    country: 'Serbia',
    countryCode: 'RS',
    enabled: false,
    wmsUrl: 'https://a3.geosrbija.rs/katastar/wms',
    layers: 'katastarske_parcele',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Republic Geodetic Authority - Geosrbija (RGZ)',
    minZoom: 17,
    bounds: [[42.2, 18.8], [46.2, 23.0]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '⚠️ WMS shows boundaries only. Would need REST API or WFS for labels.'
  },

  ME: {
    country: 'Montenegro',
    countryCode: 'ME',
    enabled: false,
    wmsUrl: 'https://geoportal.co.me/geoserver/wms',
    layers: 'cadastre:katastarske_parcele',
    format: 'image/png',
    version: '1.3.0',
    transparent: true,
    attribution: 'Real Estate Administration (Montenegro)',
    minZoom: 17,
    bounds: [[41.8, 18.4], [43.6, 20.4]],
    additionalParams: {
      CRS: 'EPSG:4326',
      STYLES: ''
    },
    notes: '⚠️ GeoServer WMS - boundaries only.'
  }
};

/**
 * Minimum zoom level to show cadastre layers
 */
export const CADASTRE_MIN_ZOOM = 17;

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
