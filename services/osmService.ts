import { NominatimResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const searchLocation = async (query: string): Promise<NominatimResult[]> => {
  if (query.trim().length < 3) {
    return [];
  }

  const params = new URLSearchParams({ query });

  try {
    const response = await fetch(`${API_URL}/geocoding/search?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: NominatimResult[] = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch locations from backend:', error);
    return [];
  }
};