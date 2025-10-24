import axios from 'axios';
import { DestinationData } from "./types";

// API Base URL - using v1 instead of v1beta
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1';
// Timeout for Gemini API calls (ms). Can be overridden with GEMINI_TIMEOUT_MS env var.
// Keep this conservative to avoid serverless function timeouts (Vercel default can be ~10s).
const DEFAULT_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS || '') || 10000;
// Allow overriding the model via env (helpful when certain models are unavailable).
// Fallback to a conservative model name; set MODEL_NAME in your environment to control it.
const DEFAULT_MODEL = process.env.MODEL_NAME || 'gemini-2.0-flash-lite';

// Simplified: keep the call minimal

export async function fetchDestinationData(destination: string): Promise<DestinationData> {
  try {
    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Use configured MODEL_NAME when possible, otherwise fall back to DEFAULT_MODEL.
    // Avoid listing models on every request to reduce latency and chance of function timeouts.
    let modelName: string = process.env.MODEL_NAME || DEFAULT_MODEL;
    console.log(`Using model: ${modelName}`);

    // Construct the API URL with the selected model
    const apiUrl = `${API_BASE_URL}/models/${modelName}:generateContent`;

    const promptText = `
      I am planning a backpacker trip to ${destination}.
      As a helpful travel guide for budget backpackers, please provide me with the following information in a structured JSON format:
      
      1. A list of 10 activities/attractions in ${destination} that backpackers would enjoy, divided into these categories: Cultural, Adventure, Nature, Food, Nightlife
      2. A list of 6 budget-friendly accommodations in ${destination}, with preference for hostels and social stays
      3. A list of 4 backpacker-friendly transport options in ${destination}
      4. A list of 5 social spots or events where backpackers can meet other travelers
      
      Format your response as a JSON object with the following structure:
      {
        "activities": [
          {"id": "act1", "name": "Activity name", "description": "Brief description", "category": "Category name"}
        ],
        "stays": [
          {"id": "stay1", "name": "Hostel name", "description": "Brief description", "price": "Approximate price range", "amenities": ["Free WiFi", "Breakfast", etc]}
        ],
        "transport": [
          {"id": "trans1", "type": "Transport type", "description": "Brief description", "cost": "Approximate cost"}
        ],
        "socialSpots": [
          {"id": "social1", "name": "Spot name", "description": "Brief description", "type": "Type of spot"}
        ]
      }
      
      Return only the JSON object, nothing else.
    `;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: promptText
            }
          ]
        }
      ]
    };

    // Direct single API call (minimal)
    let result;
    try {
      console.log(`Making API request to: ${apiUrl}`);
      const response = await axios({
        url: apiUrl,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        params: { key: API_KEY },
        data: payload,
        timeout: DEFAULT_TIMEOUT_MS
      });
      result = response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        console.error('Gemini API Error Response:', error.response?.data || error.message);
        if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
          throw new Error('Gemini request timed out');
        }
        if (status === 404) {
          const msg = `Model not found or not supported for this API/version. Model used: ${modelName}. ` +
            `Set process.env.MODEL_NAME to a supported model.`;
          throw new Error(msg);
        }
        throw new Error(`Gemini API error: ${JSON.stringify(error.response?.data || error.message)}`);
      }
      throw error;
    }

    // Extract the text response from the Gemini API result
    const text = result.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the response
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    const parsed = JSON.parse(jsonMatch[0]) as DestinationData;
    return parsed;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
