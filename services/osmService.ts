import { NominatimResult } from '../types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search?';

export const searchLocation = async (query: string): Promise<NominatimResult[]> => {
  if (query.trim().length < 3) {
    return [];
  }
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '7',
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}${params.toString()}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: NominatimResult[] = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch from Nominatim:', error);
    return [];
  }
};
