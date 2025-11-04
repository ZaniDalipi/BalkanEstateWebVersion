import { CITY_DATA } from '../services/propertyService';

// This is the type for the flattened city data.
type City = {
    name: string;
    localNames: string[];
    lat: number;
    lng: number;
}

// A squared Euclidean distance is faster than Haversine for finding the *closest* point,
// as it avoids expensive square root operations.
const squaredDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dx = lat1 - lat2;
  const dy = lon1 - lon2;
  return dx * dx + dy * dy;
};

export const findClosestCity = (lat: number, lng: number, cities: City[]): City | null => {
  if (cities.length === 0) {
    return null;
  }

  let closestCity: City = cities[0];
  let minDistance = squaredDistance(lat, lng, cities[0].lat, cities[0].lng);

  for (let i = 1; i < cities.length; i++) {
    const city = cities[i];
    const distance = squaredDistance(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  }

  return closestCity;
};
