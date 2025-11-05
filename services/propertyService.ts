import { CITY_RAW_DATA } from '../utils/cityData';

// Transform the raw city data from the new central file into the format the app expects
const transformCityData = (): { [country: string]: { name: string; localNames: string[]; lat: number; lng: number; }[] } => {
  const transformedData: { [country: string]: { name: string; localNames: string[]; lat: number; lng: number; }[] } = {};
  for (const country in CITY_RAW_DATA) {
      if (Object.prototype.hasOwnProperty.call(CITY_RAW_DATA, country)) {
          transformedData[country] = CITY_RAW_DATA[country].map(cityInfo => ({
              name: cityInfo.primary,
              localNames: cityInfo.localNames || [],
              lat: cityInfo.latitude,
              lng: cityInfo.longitude,
          }));
      }
  }
  return transformedData;
};

export const CITY_DATA: { [country: string]: { name: string; localNames: string[]; lat: number; lng: number }[] } = transformCityData();
