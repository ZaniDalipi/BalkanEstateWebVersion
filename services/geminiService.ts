import { GoogleGenAI, Type } from "@google/genai";
import { Property, PropertyImageTag, ChatMessage, AiSearchQuery } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    sq_meters: number;
    year_built: number;
    parking_spots: number;
    amenities: string[];
    key_features: string[];
    materials: string[];
    description: string;
    image_tags: ImageTag[];
}


export const generateDescriptionFromImages = async (images: File[], language: string): Promise<PropertyAnalysisResult> => {
    const imageParts = await Promise.all(images.map(fileToGenerativePart));

    const prompt = `Analyze the following images of a property. Based on the images, provide a detailed analysis of the property. The property is located in the Balkans region. The description should be written in ${language}. Provide the following details in a JSON object:
    
    1.  **description**: A compelling and detailed property description, starting with a short intro paragraph and then a bulleted list of "Key Features" and "Materials & Construction".
    2.  **bedrooms**: The number of bedrooms visible.
    3.  **bathrooms**: The number of bathrooms visible.
    4.  **sq_meters**: An estimation of the total square meters.
    5.  **year_built**: An estimation of the year the property was built.
    6.  **parking_spots**: The number of parking spots available (e.g., garage, driveway).
    7.  **amenities**: A list of amenities observed (e.g., "swimming pool", "balcony", "garden"). These will become "Special Features".
    8.  **key_features**: A list of key selling points (e.g., "modern kitchen", "hardwood floors", "city view"). These will also become "Special Features".
    9.  **materials**: A list of prominent building materials seen (e.g., "brick", "wood", "marble"). These will become "Materials".
    10. **image_tags**: For each image provided, assign a tag from the following list: 'exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'other'. The output should be an array of objects, where each object has an 'index' (corresponding to the image order, starting from 0) and a 'tag'.

    Please provide only the JSON object as a response.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: 'A compelling and detailed property description with an intro and bulleted lists for "Key Features" and "Materials & Construction".' },
            bedrooms: { type: Type.INTEGER, description: 'The number of bedrooms visible.' },
            bathrooms: { type: Type.INTEGER, description: 'The number of bathrooms visible.' },
            sq_meters: { type: Type.NUMBER, description: 'An estimation of the total square meters.' },
            year_built: { type: Type.INTEGER, description: 'An estimation of the year the property was built.' },
            parking_spots: { type: Type.INTEGER, description: 'The number of parking spots available.' },
            amenities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of amenities observed.',
            },
            key_features: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of key selling points.',
            },
            materials: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of prominent building materials seen.',
            },
            image_tags: {
                type: Type.ARRAY,
                description: 'Tags for each image provided.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        index: { type: Type.INTEGER },
                        tag: {
                            type: Type.STRING,
                            enum: ['exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 'other'],
                        },
                    },
                    required: ['index', 'tag'],
                },
            },
        },
        required: ['description', 'bedrooms', 'bathrooms', 'sq_meters', 'year_built', 'parking_spots', 'amenities', 'key_features', 'materials', 'image_tags'],
    };

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{ text: prompt }, ...imageParts] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        },
    });

    try {
        const jsonText = result.text.trim();
        const sanitizedJsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
        const parsedResult = JSON.parse(sanitizedJsonText);
        return parsedResult as PropertyAnalysisResult;
    } catch (e) {
        console.error("Error parsing Gemini response:", e);
        console.error("Raw response text:", result.text);
        throw new Error("Failed to get a valid response from the AI. Please try again.");
    }
};

export interface AiChatResponse {
    responseMessage: string;
    searchQuery: AiSearchQuery | null;
    isFinalQuery: boolean;
}

export const getAiChatResponse = async (history: ChatMessage[], properties: Property[]): Promise<AiChatResponse> => {
    const simplifiedProperties = properties.map(p => ({
        id: p.id,
        price: p.price,
        city: p.city,
        country: p.country,
        beds: p.beds,
        baths: p.baths,
        sqft: p.sqft,
        specialFeatures: p.specialFeatures,
    }));

    const chatHistoryString = history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');

    const systemPrompt = `
        You are a professional, friendly, and helpful real-estate assistant for the "Balkan Estate" agency. Your job is to help buyers find properties in the Balkans that match their preferences by chatting with them naturally.

        Your main goal is to understand the user's needs and convert their conversational request into a structured search query. Be concise and helpful. Never be salesy.

        You have access to a list of properties. Use their attributes (city, country, price, beds, baths, specialFeatures) to understand what's available.

        **Your instructions are:**
        1.  **Engage Naturally:** Start with a friendly greeting if it's the beginning of the conversation.
        2.  **Understand Intent:** Interpret casual language (e.g., "something cozy" might mean a smaller apartment or house).
        3.  **Ask Clarifying Questions:** If key details like budget, location, or number of bedrooms are missing, ask a SINGLE, brief follow-up question. Do not ask multiple questions at once.
        4.  **Formulate a Search Query:** Once you have enough information (usually location and price range), formulate a structured JSON search query.
        5.  **Respond in JSON:** Your entire response MUST be a single JSON object.
        6.  **Crucially, when you set isFinalQuery to true, your responseMessage should ask the user to confirm by clicking the 'Apply Filters' button.** This gives them control.

        **JSON Output Structure:**
        You must return a JSON object with three fields:
        - \`responseMessage\`: A string containing your friendly, natural language message to the user.
        - \`searchQuery\`: A JSON object with the extracted search criteria (fields: location, minPrice, maxPrice, beds, baths, features). Set this to \`null\` if you don't have enough information to search yet.
        - \`isFinalQuery\`: A boolean. Set to \`true\` only when you have sufficient information and have provided a \`searchQuery\`. Otherwise, set it to \`false\`.

        **Example Interaction:**
        User: "I'm looking for something quiet in Belgrade under 400k."
        Your JSON Response:
        {
          "responseMessage": "Great! A quiet place in Belgrade for under 400,000 €. Are you looking for a specific number of bedrooms?",
          "searchQuery": null,
          "isFinalQuery": false
        }

        User: "At least 3 bedrooms."
        Your JSON Response:
        {
          "responseMessage": "Okay, I've put together a search for a quiet property in Belgrade with at least 3 bedrooms, for under 400,000 €. Does that sound right? If so, just hit 'Apply Filters' below!",
          "searchQuery": {
            "location": "Belgrade",
            "maxPrice": 400000,
            "beds": 3,
            "features": ["quiet"]
          },
          "isFinalQuery": true
        }

        ---
        **Available Property Data Context (for your reference):**
        ${JSON.stringify(simplifiedProperties.slice(0, 10), null, 2)}
        ---
        **Current Conversation History:**
        ${chatHistoryString}
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            responseMessage: { type: Type.STRING, description: 'Your friendly, natural language message to the user.' },
            searchQuery: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                    location: { type: Type.STRING, description: 'The city or area to search in.' },
                    minPrice: { type: Type.NUMBER },
                    maxPrice: { type: Type.NUMBER },
                    beds: { type: Type.INTEGER },
                    baths: { type: Type.INTEGER },
                    features: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
            },
            isFinalQuery: { type: Type.BOOLEAN, description: 'True if the searchQuery is ready to be executed.' },
        },
        required: ['responseMessage', 'searchQuery', 'isFinalQuery'],
    };

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: systemPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        },
    });

    try {
        const jsonText = result.text.trim();
        const parsedResult = JSON.parse(jsonText);
        return parsedResult as AiChatResponse;
    } catch (e) {
        console.error("Error parsing Gemini chat response:", e);
        console.error("Raw chat response text:", result.text);
        return {
            responseMessage: "I'm having a little trouble understanding. Could you please rephrase your request, or try using the manual filters?",
            searchQuery: null,
            isFinalQuery: false,
        };
    }
};