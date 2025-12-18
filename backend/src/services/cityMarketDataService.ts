import { GoogleGenAI } from '@google/genai';
import CityMarketData, { ICityMarketData } from '../models/CityMarketData';
import Property from '../models/Property';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '' });

interface CityDataFromGemini {
  city: string;
  country: string;
  countryCode: string;
  avgPricePerSqm: number;
  medianPrice: number;
  priceGrowthYoY: number;
  averageDaysOnMarket: number;
  demandScore: number;
  rentalYield: number;
  investmentScore: number;
  topNeighborhoods: string[];
  marketTrend: 'rising' | 'stable' | 'declining';
  highlights: string[];
}

/**
 * Selected cities to feature across all Balkan countries
 * Chosen based on population, economic importance, and tourism
 */
const FEATURED_CITIES = [
  // Kosovo - 3 cities
  { city: 'Prishtina', country: 'Kosovo', countryCode: 'XK' },
  { city: 'Prizren', country: 'Kosovo', countryCode: 'XK' },
  { city: 'Peja', country: 'Kosovo', countryCode: 'XK' },

  // Albania - 4 cities
  { city: 'Tirana', country: 'Albania', countryCode: 'AL' },
  { city: 'Durres', country: 'Albania', countryCode: 'AL' },
  { city: 'Vlore', country: 'Albania', countryCode: 'AL' },
  { city: 'Sarande', country: 'Albania', countryCode: 'AL' },

  // North Macedonia - 3 cities
  { city: 'Skopje', country: 'North Macedonia', countryCode: 'MK' },
  { city: 'Ohrid', country: 'North Macedonia', countryCode: 'MK' },
  { city: 'Bitola', country: 'North Macedonia', countryCode: 'MK' },

  // Serbia - 4 cities
  { city: 'Belgrade', country: 'Serbia', countryCode: 'RS' },
  { city: 'Novi Sad', country: 'Serbia', countryCode: 'RS' },
  { city: 'Nis', country: 'Serbia', countryCode: 'RS' },
  { city: 'Kragujevac', country: 'Serbia', countryCode: 'RS' },

  // Bosnia and Herzegovina - 3 cities
  { city: 'Sarajevo', country: 'Bosnia and Herzegovina', countryCode: 'BA' },
  { city: 'Banja Luka', country: 'Bosnia and Herzegovina', countryCode: 'BA' },
  { city: 'Mostar', country: 'Bosnia and Herzegovina', countryCode: 'BA' },

  // Croatia - 4 cities
  { city: 'Zagreb', country: 'Croatia', countryCode: 'HR' },
  { city: 'Split', country: 'Croatia', countryCode: 'HR' },
  { city: 'Dubrovnik', country: 'Croatia', countryCode: 'HR' },
  { city: 'Rijeka', country: 'Croatia', countryCode: 'HR' },

  // Montenegro - 3 cities
  { city: 'Podgorica', country: 'Montenegro', countryCode: 'ME' },
  { city: 'Budva', country: 'Montenegro', countryCode: 'ME' },
  { city: 'Kotor', country: 'Montenegro', countryCode: 'ME' },

  // Greece - 4 cities
  { city: 'Athens', country: 'Greece', countryCode: 'GR' },
  { city: 'Thessaloniki', country: 'Greece', countryCode: 'GR' },
  { city: 'Patras', country: 'Greece', countryCode: 'GR' },
  { city: 'Heraklion', country: 'Greece', countryCode: 'GR' },

  // Bulgaria - 4 cities
  { city: 'Sofia', country: 'Bulgaria', countryCode: 'BG' },
  { city: 'Plovdiv', country: 'Bulgaria', countryCode: 'BG' },
  { city: 'Varna', country: 'Bulgaria', countryCode: 'BG' },
  { city: 'Burgas', country: 'Bulgaria', countryCode: 'BG' },

  // Romania - 4 cities
  { city: 'Bucharest', country: 'Romania', countryCode: 'RO' },
  { city: 'Cluj-Napoca', country: 'Romania', countryCode: 'RO' },
  { city: 'Timisoara', country: 'Romania', countryCode: 'RO' },
  { city: 'Brasov', country: 'Romania', countryCode: 'RO' },
];

/**
 * Fetch market data from Gemini for a batch of cities
 * Uses a single API call to process multiple cities efficiently
 */
async function fetchCityDataFromGemini(cities: Array<{ city: string; country: string; countryCode: string }>): Promise<CityDataFromGemini[]> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
    console.warn('⚠️ Gemini API key not configured. Skipping market data fetch.');
    return [];
  }

  const citiesList = cities.map(c => `${c.city}, ${c.country}`).join('; ');

  const prompt = `You are a real estate market analyst. Provide current 2025 real estate market data for these Balkan cities: ${citiesList}

For each city, provide realistic market data based on general economic trends, tourism, and typical Balkan real estate patterns. Return ONLY valid JSON array format with this structure:

[
  {
    "city": "City Name",
    "country": "Country Name",
    "countryCode": "XX",
    "avgPricePerSqm": <number in EUR>,
    "medianPrice": <number in EUR for 70sqm apartment>,
    "priceGrowthYoY": <percentage, can be negative>,
    "averageDaysOnMarket": <number of days>,
    "demandScore": <0-100, higher = more demand>,
    "rentalYield": <percentage 3-8%>,
    "investmentScore": <0-100, investment potential>,
    "topNeighborhoods": ["Neighborhood1", "Neighborhood2", "Neighborhood3"],
    "marketTrend": "rising|stable|declining",
    "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
  }
]

Guidelines:
- Capital cities typically have higher prices (€1500-2500/sqm)
- Coastal/tourist cities have good rental yields (5-8%)
- Smaller cities have lower prices (€800-1500/sqm)
- Rising markets have 8-15% YoY growth
- Stable markets have 2-7% YoY growth
- Declining markets have -3% to 2% growth
- Return realistic neighborhood names for each city
- Highlights should mention key factors (tourism, economy, infrastructure, etc.)

Return only the JSON array, no other text.`;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash', // Use flash for cost efficiency
      contents: prompt,
    });

    if (!result.text) {
      throw new Error('No text returned from Gemini API');
    }

    const responseText = result.text;

    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in Gemini response');
    }

    const data: CityDataFromGemini[] = JSON.parse(jsonMatch[0]);
    console.log(`✅ Fetched market data for ${data.length} cities from Gemini`);

    return data;
  } catch (error) {
    console.error('❌ Error fetching city data from Gemini:', error);
    return [];
  }
}

/**
 * Calculate market data from actual properties in the database
 * Used as fallback or supplement to Gemini data
 */
async function calculateMarketDataFromProperties(city: string, country: string): Promise<Partial<ICityMarketData> | null> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const properties = await Property.find({
      city,
      country,
      status: { $in: ['active', 'sold'] },
    });

    if (properties.length < 3) {
      return null; // Not enough data
    }

    const prices = properties.map(p => p.price / (p.sqft || 70)); // Price per sqft, default 70 if missing
    const avgPricePerSqm = (prices.reduce((a, b) => a + b, 0) / prices.length) * 10.764; // Convert sqft to sqm

    const activeDays = properties
      .filter(p => p.status === 'active' && p.createdAt)
      .map(p => Math.floor((Date.now() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24)));

    const averageDaysOnMarket = activeDays.length > 0
      ? activeDays.reduce((a, b) => a + b, 0) / activeDays.length
      : 45;

    const soldLastMonth = properties.filter(
      p => p.status === 'sold' && p.updatedAt && p.updatedAt > thirtyDaysAgo
    ).length;

    return {
      avgPricePerSqm: Math.round(avgPricePerSqm),
      listingsCount: properties.length,
      averageDaysOnMarket: Math.round(averageDaysOnMarket),
      soldLastMonth,
      dataSource: 'calculated',
    };
  } catch (error) {
    console.error(`Error calculating market data for ${city}:`, error);
    return null;
  }
}

/**
 * Update market data for all featured cities
 * This should be called twice per month (biweekly)
 */
export async function updateAllCityMarketData(): Promise<void> {
  console.log('🔄 Starting biweekly market data update for all featured cities...');

  // Process cities in batches of 10 to avoid token limits
  const BATCH_SIZE = 10;
  let updatedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < FEATURED_CITIES.length; i += BATCH_SIZE) {
    const batch = FEATURED_CITIES.slice(i, i + BATCH_SIZE);

    console.log(`📊 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(FEATURED_CITIES.length / BATCH_SIZE)}...`);

    try {
      const geminiData = await fetchCityDataFromGemini(batch);

      for (const cityInfo of batch) {
        try {
          const geminiCityData = geminiData.find(
            d => d.city === cityInfo.city && d.country === cityInfo.country
          );

          // Calculate actual market data from properties
          const calculatedData = await calculateMarketDataFromProperties(cityInfo.city, cityInfo.country);

          if (!geminiCityData && !calculatedData) {
            console.warn(`⚠️ No data available for ${cityInfo.city}, ${cityInfo.country}`);
            failedCount++;
            continue;
          }

          // Merge Gemini and calculated data
          const marketData: Partial<ICityMarketData> = {
            city: cityInfo.city,
            country: cityInfo.country,
            countryCode: cityInfo.countryCode,
            ...(geminiCityData || {}),
            ...(calculatedData || {}),
            lastUpdated: new Date(),
            featured: true,
            displayOrder: i,
          };

          // If we have Gemini data but also calculated data, blend them
          if (geminiCityData && calculatedData) {
            marketData.avgPricePerSqm = Math.round((geminiCityData.avgPricePerSqm + calculatedData.avgPricePerSqm!) / 2);
            marketData.dataSource = 'gemini';
          }

          await CityMarketData.findOneAndUpdate(
            { city: cityInfo.city, country: cityInfo.country },
            marketData,
            { upsert: true, new: true }
          );

          updatedCount++;
          console.log(`✅ Updated market data for ${cityInfo.city}, ${cityInfo.country}`);
        } catch (error) {
          console.error(`❌ Failed to update ${cityInfo.city}:`, error);
          failedCount++;
        }
      }

      // Add delay between batches to respect rate limits
      if (i + BATCH_SIZE < FEATURED_CITIES.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    } catch (error) {
      console.error(`❌ Batch processing failed:`, error);
      failedCount += batch.length;
    }
  }

  console.log(`✅ Market data update complete: ${updatedCount} updated, ${failedCount} failed`);
}

/**
 * Get featured city recommendations
 */
export async function getFeaturedCities(limit: number = 12): Promise<ICityMarketData[]> {
  try {
    const cities = await CityMarketData.find({ featured: true })
      .sort({ displayOrder: 1 })
      .limit(limit);

    return cities;
  } catch (error) {
    console.error('Error fetching featured cities:', error);
    return [];
  }
}

/**
 * Get city recommendations by country
 */
export async function getCitiesByCountry(country: string): Promise<ICityMarketData[]> {
  try {
    const cities = await CityMarketData.find({ country })
      .sort({ demandScore: -1, avgPricePerSqm: 1 });

    return cities;
  } catch (error) {
    console.error(`Error fetching cities for ${country}:`, error);
    return [];
  }
}

/**
 * Get market data for a specific city
 */
export async function getCityMarketData(city: string, country: string): Promise<ICityMarketData | null> {
  try {
    const data = await CityMarketData.findOne({ city, country });
    return data;
  } catch (error) {
    console.error(`Error fetching market data for ${city}:`, error);
    return null;
  }
}
