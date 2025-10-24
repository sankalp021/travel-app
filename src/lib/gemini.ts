import axios from 'axios';
import { DestinationData } from "./types";

// API Base URL - using v1 instead of v1beta
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1';
// Timeout for Gemini API calls (ms). Can be overridden with GEMINI_TIMEOUT_MS env var.
const DEFAULT_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS || '') || 15000;
// Allow overriding the model via env (helpful when certain models are unavailable).
// Fallback to a conservative model name that historically existed; users should
// set MODEL_NAME in their environment to a model listed by listAvailableModels().
const DEFAULT_MODEL = process.env.MODEL_NAME || 'gemini-1.5';

// Queue system for API requests to respect rate limits
class RequestQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private RATE_LIMIT_DELAY = 1000; // 1 second between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
            await new Promise(r => setTimeout(r, this.RATE_LIMIT_DELAY - timeSinceLastRequest));
          }
          this.lastRequestTime = Date.now();
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) await request();
    }
    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

interface Model {
  name: string;
  // Add other properties if needed
}

export async function listAvailableModels(): Promise<Model[]> {
  try {
    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    const response = await axios({
      url: `${API_BASE_URL}/models`,
      method: 'GET',
      params: { key: API_KEY },
      timeout: DEFAULT_TIMEOUT_MS
    });

    return response.data.models;
  } catch (error) {
    console.error("Error listing models:", error);
    throw error;
  }
}

export async function fetchDestinationData(destination: string): Promise<DestinationData> {
  try {
    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    // Determine which model to use. Priority:
    // 1. process.env.MODEL_NAME
    // 2. A preferred model found in the available models list
    // 3. DEFAULT_MODEL
    let modelName: string | undefined = process.env.MODEL_NAME;
    try {
      const models = await listAvailableModels();
      console.log("Available models:", models.map(m => m.name));

      if (!modelName) {
        const preferredModels = ['gemini-2.5', 'gemini-2.5-pro', 'gemini-pro', 'gemini-1.5-flash'];
        for (const preferred of preferredModels) {
          const found = models.find(m => m.name.includes(preferred));
          if (found) {
            modelName = found.name.split('/').pop(); // Extract just the model name
            console.log(`Using discovered model: ${modelName}`);
            break;
          }
        }
      }

      if (!modelName) {
        modelName = DEFAULT_MODEL;
        console.log(`No preferred model found. Using default: ${modelName}`);
      }
    } catch (error) {
      console.error("Error getting models list, using default:", error);
      if (!modelName) modelName = DEFAULT_MODEL;
    }

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
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096
      }
    };

    // Using the RequestQueue to manage API call rate limiting
    const result = await requestQueue.add(async () => {
      try {
        console.log(`Making API request to: ${apiUrl}`);
        const response = await axios({
          url: apiUrl,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          params: { key: API_KEY },
          data: payload,
          timeout: DEFAULT_TIMEOUT_MS * 2 // allow a bit more time for generation
        });
        
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          console.error('Gemini API Error Response:', error.response?.data);
          if (status === 404) {
            const msg = `Model not found or not supported for this API/version. Model used: ${modelName}. ` +
              `Call listAvailableModels() or set process.env.MODEL_NAME to a supported model.`;
            throw new Error(msg);
          }
          throw new Error(`Gemini API error: ${JSON.stringify(error.response?.data || error.message)}`);
        }
        throw error;
      }
    });

    // Extract the text response from the Gemini API result
    const text = result.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the response
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    return JSON.parse(jsonMatch[0]) as DestinationData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
