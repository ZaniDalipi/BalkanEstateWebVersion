import { Property, PropertyImageTag, ChatMessage, AiSearchQuery, Filters } from '../types';

// Get API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('balkan_estate_token');
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export interface ImageTag {
    index: number;
    tag: PropertyImageTag;
}

export interface PropertyAnalysisResult {
    bedrooms: number;
    bathrooms: number;
    living_rooms: number;
    sq_meters: number;
    year_built: number;
    parking_spots: number;
    amenities: string[];
    key_features: string[];
    materials: string[];
    description: string;
    image_tags: ImageTag[];
    property_type: 'house' | 'apartment' | 'villa' | 'other';
    floor_number?: number;
    total_floors?: number;
}


export const generateDescriptionFromImages = async (
    images: File[],
    language: string,
    propertyType: 'house' | 'apartment' | 'villa' | 'other'
): Promise<PropertyAnalysisResult> => {
    // Convert images to base64
    const imageParts = await Promise.all(images.map(fileToGenerativePart));

    // Prepare images for backend API
    const imageData = imageParts.map(part => ({
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
    }));

    const token = getToken();
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }

    try {
        const response = await fetch(`${API_URL}/ai/property/insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                images: imageData,
                language,
                propertyType,
            }),
        });

        if (!response.ok) {
            const error = await response.json();

            // Check if it's a limit error
            if (error.code === 'FEATURE_LIMIT_REACHED') {
                const limitError: any = new Error(error.message);
                limitError.code = 'FEATURE_LIMIT_REACHED';
                limitError.limit = error.limit;
                limitError.current = error.current;
                limitError.recommendedProducts = error.recommendedProducts;
                limitError.upgradeMessage = error.upgradeMessage;
                throw limitError;
            }

            throw new Error(error.message || 'Failed to analyze property images');
        }

        const data = await response.json();
        return data.result as PropertyAnalysisResult;
    } catch (e: any) {
        console.error("Error analyzing property images:", e);
        throw e;
    }
};

export interface AiChatResponse {
    responseMessage: string;
    searchQuery: AiSearchQuery | null;
    isFinalQuery: boolean;
}

export const getAiChatResponse = async (history: ChatMessage[], properties: Property[]): Promise<AiChatResponse> => {
    const token = getToken();
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }

    try {
        const response = await fetch(`${API_URL}/ai/search/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                history,
                properties,
            }),
        });

        if (!response.ok) {
            const error = await response.json();

            // Check if it's a limit error
            if (error.code === 'FEATURE_LIMIT_REACHED') {
                const limitError: any = new Error(error.message);
                limitError.code = 'FEATURE_LIMIT_REACHED';
                limitError.limit = error.limit;
                limitError.current = error.current;
                limitError.recommendedProducts = error.recommendedProducts;
                limitError.upgradeMessage = error.upgradeMessage;
                throw limitError;
            }

            throw new Error(error.message || 'Failed to process AI search');
        }

        const data = await response.json();
        return {
            responseMessage: data.responseMessage,
            searchQuery: data.searchQuery,
            isFinalQuery: data.isFinalQuery,
        };
    } catch (e: any) {
        console.error("Error in AI search chat:", e);

        // If it's a limit error, re-throw it
        if (e.code === 'FEATURE_LIMIT_REACHED') {
            throw e;
        }

        // Return fallback response for other errors
        return {
            responseMessage: "I'm having a little trouble understanding. Could you please rephrase your request, or try using the manual filters?",
            searchQuery: null,
            isFinalQuery: false,
        };
    }
};

export const generateSearchName = async (filters: Filters): Promise<string> => {
    // Simple client-side name generation (no AI needed for this)
    const parts: string[] = [];

    if (filters.query) parts.push(filters.query);

    if (filters.minPrice && filters.maxPrice) {
        parts.push(`€${filters.minPrice / 1000}k - €${filters.maxPrice / 1000}k`);
    } else if (filters.maxPrice) {
        parts.push(`under €${filters.maxPrice / 1000}k`);
    } else if (filters.minPrice) {
        parts.push(`over €${filters.minPrice / 1000}k`);
    }

    if (filters.beds) parts.push(`${filters.beds}+ beds`);
    if (filters.baths) parts.push(`${filters.baths}+ baths`);
    if (filters.livingRooms) parts.push(`${filters.livingRooms}+ living rooms`);

    if (filters.minSqft && filters.maxSqft) {
        parts.push(`${filters.minSqft}-${filters.maxSqft}m²`);
    } else if (filters.minSqft) {
        parts.push(`over ${filters.minSqft}m²`);
    } else if (filters.maxSqft) {
        parts.push(`under ${filters.maxSqft}m²`);
    }

    if (filters.sellerType && filters.sellerType !== 'any') {
        parts.push(`by ${filters.sellerType}`);
    }

    return parts.join(', ') || 'My Search';
};

export const generateSearchNameFromCoords = async (lat: number, lng: number): Promise<string> => {
    // Simple fallback - just return coordinates
    // In production, you could use reverse geocoding API
    return `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

export const getNeighborhoodInsights = async (lat: number, lng: number, city: string, country: string): Promise<string> => {
    const token = getToken();
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }

    try {
        const response = await fetch(`${API_URL}/ai/neighborhood/insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                lat,
                lng,
                city,
                country,
            }),
        });

        if (!response.ok) {
            const error = await response.json();

            // Check if it's a limit error
            if (error.code === 'FEATURE_LIMIT_REACHED') {
                const limitError: any = new Error(error.message);
                limitError.code = 'FEATURE_LIMIT_REACHED';
                limitError.limit = error.limit;
                limitError.current = error.current;
                limitError.recommendedProducts = error.recommendedProducts;
                limitError.upgradeMessage = error.upgradeMessage;
                throw limitError;
            }

            throw new Error(error.message || 'Failed to retrieve neighborhood insights');
        }

        const data = await response.json();
        return data.insights;
    } catch (e: any) {
        console.error("Error fetching neighborhood insights:", e);

        // If it's a limit error, re-throw it
        if (e.code === 'FEATURE_LIMIT_REACHED') {
            throw e;
        }

        throw new Error("Could not retrieve neighborhood insights at this time.");
    }
};