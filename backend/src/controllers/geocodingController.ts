import { Request, Response } from 'express';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search?';
const BALKAN_COUNTRY_CODES = 'gr,al,mk,bg,xk,rs,me,ba,hr,ro';

// @desc    Search locations using Nominatim (proxy to avoid CORS)
// @route   GET /api/geocoding/search
// @access  Public
export const searchLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      res.json([]);
      return;
    }

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '7',
      countrycodes: BALKAN_COUNTRY_CODES,
    });

    console.log('Geocoding search for:', query);

    const response = await fetch(`${NOMINATIM_BASE_URL}${params.toString()}`, {
      headers: {
        'User-Agent': 'BalkanEstate/1.0', // Nominatim requires a User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Geocoding search error:', error);
    res.status(500).json({ message: 'Error searching location', error: error.message });
  }
};
