import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { incrementFeatureUsage, getUsageStats } from '../services/featureUsageService';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * AI Search Chat - Process user queries and return property search parameters
 */
export const aiSearchChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { history, properties } = req.body;

    if (!history || !Array.isArray(history)) {
      res.status(400).json({ message: 'Chat history is required' });
      return;
    }

    // Simplify properties for AI context
    const simplifiedProperties = (properties || []).map((p: any) => ({
      id: p.id,
      price: p.price,
      city: p.city,
      country: p.country,
      beds: p.beds,
      baths: p.baths,
      livingRooms: p.livingRooms,
      sqft: p.sqft,
      specialFeatures: p.specialFeatures,
    }));

    const chatHistoryString = history.map((msg: any) => `${msg.sender}: ${msg.text}`).join('\n');

    const systemPrompt = `
        You are a professional, friendly, and helpful real-estate assistant for the "Balkan Estate" agency. Your job is to help buyers find properties in the Balkans that match their preferences by chatting with them naturally.

        Your main goal is to understand the user's needs and convert their conversational request into a structured search query. Be concise and helpful. Never be salesy.

        You have access to a list of properties. Use their attributes (city, country, price, beds, baths, livingRooms, sqft, specialFeatures) to understand what's available.

        **Your instructions are:**
        1.  **Engage Naturally:** Start with a friendly greeting if it's the beginning of the conversation.
        2.  **Language Matching:** Your entire 'responseMessage' MUST be in the same language as the user's last message. For example, if the user writes in Serbian, you must reply in Serbian. If you are unsure of the language, default to English.
        3.  **Understand Intent:** Interpret casual language (e.g., "something cozy" might mean a smaller apartment or house).
        4.  **Ask Clarifying Questions:** If key details like budget, location, or number of bedrooms/living rooms are missing, ask a SINGLE, brief follow-up question. Do not ask multiple questions at once.
        5.  **Formulate a Search Query:** Once you have enough information (usually location and price range), formulate a structured JSON search query. You can also ask about size in square meters (m²).
        6.  **Respond in JSON:** Your entire response MUST be a single JSON object.
        7.  **Crucially, when you set isFinalQuery to true, your responseMessage should ask the user to confirm by clicking the 'Apply Filters' button.** This gives them control.

        **JSON Output Structure:**
        You must return a JSON object with three fields:
        - \`responseMessage\`: A string containing your friendly, natural language message to the user, matching the user's language.
        - \`searchQuery\`: A JSON object with the extracted search criteria (fields: location, minPrice, maxPrice, beds, baths, livingRooms, minSqft, maxSqft, features). Set this to \`null\` if you don't have enough information to search yet.
        - \`isFinalQuery\`: A boolean. Set to \`true\` only when you have sufficient information and have provided a \`searchQuery\`. Otherwise, set it to \`false\`.

        **Available Property Data Context (for your reference):**
        ${JSON.stringify(simplifiedProperties.slice(0, 10), null, 2)}
        ---
        **Current Conversation History:**
        ${chatHistoryString}
    `;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    let parsedResult;
    try {
      parsedResult = JSON.parse(text);
    } catch (e) {
      parsedResult = {
        responseMessage: "I'm having a little trouble understanding. Could you please rephrase your request, or try using the manual filters?",
        searchQuery: null,
        isFinalQuery: false,
      };
    }

    // Increment usage
    const usage = await incrementFeatureUsage(userId, 'ai_search');

    res.json({
      ...parsedResult,
      usage: {
        current: usage.current,
        limit: usage.limit,
        remaining: usage.remaining,
      },
    });
  } catch (error: any) {
    console.error('AI search chat error:', error);
    res.status(500).json({ message: 'Error processing AI search request' });
  }
};

/**
 * AI Property Insights - Analyze property images and generate description
 */
export const aiPropertyInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { images, language, propertyType } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      res.status(400).json({ message: 'At least one image is required' });
      return;
    }

    if (!language) {
      res.status(400).json({ message: 'Language is required' });
      return;
    }

    if (!propertyType) {
      res.status(400).json({ message: 'Property type is required' });
      return;
    }

    // Convert base64 images to Gemini format
    const imageParts = images.map((img: { data: string; mimeType: string }) => ({
      inlineData: {
        data: img.data,
        mimeType: img.mimeType,
      },
    }));

    const prompt = `Analyze the following images for a property that is a(n) "${propertyType}". Based on the images and knowing its type, provide a detailed analysis. The property is in the Balkans. The description should be written in ${language} and be tailored specifically for a(n) "${propertyType}". Provide the following details in a JSON object:

    1.  **description**: A compelling and detailed property description, starting with a short intro paragraph and then a bulleted list of "Key Features" and "Materials & Construction". Make sure the tone and focus of the description are appropriate for a(n) "${propertyType}".
    2.  **bedrooms**: The number of bedrooms visible.
    3.  **bathrooms**: The number of bathrooms visible.
    4.  **living_rooms**: The number of living rooms visible.
    5.  **sq_meters**: An estimation of the total square meters.
    6.  **year_built**: An estimation of the year the property was built.
    7.  **parking_spots**: The number of parking spots available (e.g., garage, driveway).
    8.  **amenities**: A list of amenities observed (e.g., "swimming pool", "balcony", "garden"). These will become "Special Features".
    9.  **key_features**: A list of key selling points (e.g., "modern kitchen", "hardwood floors", "city view"). These will also become "Special Features".
    10. **materials**: A list of prominent building materials seen (e.g., "brick", "wood", "marble"). These will become "Materials".
    11. **image_tags**: For each image provided, assign a tag from the following list: 'exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'other'. The output should be an array of objects, where each object has an 'index' (corresponding to the image order, starting from 0) and a 'tag'.
    12. **property_type**: Confirm the property type based on my input. It must be "${propertyType}".
    13. **floor_number**: If the property is an 'apartment', estimate what floor it is on. Provide a single integer. If it's not an apartment or you cannot tell, omit this field.
    14. **total_floors**: If the property is a 'house' or 'villa', estimate the total number of floors (e.g., 1, 2, 3). If it is not a house or villa or you cannot tell, omit this field.

    Please provide only the JSON object as a response.
    `;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    let parsedResult;
    try {
      const sanitizedText = text.trim().replace(/^```json\n/, '').replace(/\n```$/, '');
      parsedResult = JSON.parse(sanitizedText);
    } catch (e) {
      console.error('Error parsing AI response:', e);
      res.status(500).json({ message: 'Failed to get a valid response from the AI. Please try again.' });
      return;
    }

    // Increment usage
    const usage = await incrementFeatureUsage(userId, 'ai_property_insights');

    res.json({
      result: parsedResult,
      usage: {
        current: usage.current,
        limit: usage.limit,
        remaining: usage.remaining,
      },
    });
  } catch (error: any) {
    console.error('AI property insights error:', error);
    res.status(500).json({ message: 'Error processing AI property insights request' });
  }
};

/**
 * AI Neighborhood Insights - Get location-based neighborhood information
 */
export const aiNeighborhoodInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { lat, lng, city, country } = req.body;

    if (!lat || !lng || !city || !country) {
      res.status(400).json({ message: 'Latitude, longitude, city, and country are required' });
      return;
    }

    const prompt = `
        You are a helpful local guide for the "Balkan Estate" real estate agency.
        A user is looking at a property located in ${city}, ${country} at coordinates (latitude: ${lat}, longitude: ${lng}).

        Based on these coordinates, generate a proximity-based summary of the neighborhood. Your response should be helpful for someone considering moving there. Structure your response as a short introductory paragraph followed by a bulleted list.

        **Crucially, identify specific, named points of interest and describe how close they are.** Focus on:
        - **Schools:** Name specific schools (e.g., "Ivan Gundulić Elementary School").
        - **Parks:** Name specific parks (e.g., "Kalemegdan Park").
        - **Public Transport:** Name specific train, tram, or bus stations.
        - **Other Amenities:** Mention key markets, cafes, or cultural sites by name if they are significant landmarks.

        Use phrases like "a short walk to...", "just 5 minutes from...", "conveniently close to...". Keep the tone friendly and informative. Do not mention the specific coordinates in your response. The response should be in markdown format.

        Example response format:
        This property offers excellent connectivity and convenience, located in a well-established neighborhood. Everything you need is right on your doorstep.

        *   **Education:** It is a 5-minute walk from the highly-regarded **"Sveti Sava" Primary School**.
        *   **Recreation:** You'll be just around the corner from **Tašmajdan Park**, perfect for morning jogs or relaxing weekends.
        *   **Transport:** The main **Vukov Spomenik train station** is conveniently located a 10-minute walk away, providing easy access across the city.
        *   **Shopping:** The well-known **Kalenić Market** is also nearby for fresh, local produce.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Increment usage
    const usage = await incrementFeatureUsage(userId, 'neighborhood_insights');

    res.json({
      insights: text.trim(),
      usage: {
        current: usage.current,
        limit: usage.limit,
        remaining: usage.remaining,
      },
    });
  } catch (error: any) {
    console.error('AI neighborhood insights error:', error);
    res.status(500).json({ message: 'Error processing neighborhood insights request' });
  }
};

/**
 * Get user's current feature usage statistics
 */
export const getFeatureUsageStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const stats = await getUsageStats(userId);

    res.json({
      stats,
      message: 'Feature usage statistics retrieved successfully',
    });
  } catch (error: any) {
    console.error('Get feature usage stats error:', error);
    res.status(500).json({ message: 'Error retrieving feature usage statistics' });
  }
};
