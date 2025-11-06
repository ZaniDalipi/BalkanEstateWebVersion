import { MUNICIPALITY_RAW_DATA } from '../utils/cityData';
import { MunicipalityData } from '../types';

// Transform the new raw municipality data into the format the app expects
const transformMunicipalityData = (): Record<string, MunicipalityData[]> => {
  const transformedData: Record<string, MunicipalityData[]> = {};
  for (const country in MUNICIPALITY_RAW_DATA) {
      if (Object.prototype.hasOwnProperty.call(MUNICIPALITY_RAW_DATA, country)) {
          transformedData[country] = MUNICIPALITY_RAW_DATA[country].map(municipality => ({
              name: municipality.name,
              localNames: municipality.localNames || [],
              lat: municipality.latitude,
              lng: municipality.longitude,
              settlements: municipality.settlements.map(settlement => ({
                name: settlement.name,
                localNames: settlement.localNames || [],
                lat: settlement.latitude,
                lng: settlement.longitude
              }))
          }));
      }
  }
  return transformedData;
};

export const MUNICIPALITY_DATA: Record<string, MunicipalityData[]> = transformMunicipalityData();
