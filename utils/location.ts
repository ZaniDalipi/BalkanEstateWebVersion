import { MunicipalityData, SettlementData } from '../types';

// A squared Euclidean distance is faster than Haversine for finding the *closest* point,
// as it avoids expensive square root operations.
const squaredDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dx = lat1 - lat2;
  const dy = lon1 - lon2;
  return dx * dx + dy * dy;
};

// FIX: Added 'country' to the result interface to provide full location context.
interface ClosestSettlementResult {
    settlement: SettlementData;
    municipality: MunicipalityData;
    country: string;
}

export const findClosestSettlement = (lat: number, lng: number, municipalities: Record<string, MunicipalityData[]>): ClosestSettlementResult | null => {
  let closest: ClosestSettlementResult | null = null;
  let minDistance = Infinity;
  
  for (const country in municipalities) {
    for (const municipality of municipalities[country]) {
      for (const settlement of municipality.settlements) {
        const distance = squaredDistance(lat, lng, settlement.lat, settlement.lng);
        if (distance < minDistance) {
          minDistance = distance;
          // FIX: Include the country in the result object.
          closest = { settlement, municipality, country };
        }
      }
    }
  }

  return closest;
};