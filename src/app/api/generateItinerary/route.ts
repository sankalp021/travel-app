import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import { buildItineraryPrompt, parseItineraryResponse } from "@/lib/itineraryPrompt";
import { UserSelections, ItineraryResult } from "@/lib/types";

// Base API URL for Gemini
const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1';
const DEFAULT_MODEL = 'gemini-1.5-flash';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const userSelections: UserSelections = await request.json();
    
    // Validate required fields
    if (!userSelections.destination || !userSelections.preferences.startDate || !userSelections.preferences.endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    console.log(`Generating itinerary for ${userSelections.destination} with ${userSelections.selectedActivities.length} activities`);
    
    // Build the prompt for Gemini API
    const promptText = buildItineraryPrompt(userSelections);
    
    // Get API key
    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!API_KEY) {
      throw new Error("Gemini API key is not configured");
    }
    
    // Construct API URL
    const apiUrl = `${API_BASE_URL}/models/${DEFAULT_MODEL}:generateContent`;
    
    // Build payload
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
        temperature: 0.4,   // Lower temperature for more structured output
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192  // Need a larger token limit for detailed itineraries
      }
    };
    
    // Make the API call
    console.log(`Sending request to Gemini API (${DEFAULT_MODEL}) to generate itinerary...`);
    const response = await axios({
      url: apiUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      params: { key: API_KEY },
      data: payload
    });
    
    console.log("Received response from Gemini API, parsing...");
    
    // Extract the text response
    const text = response.data.candidates[0].content.parts[0].text;
    
    // Parse and validate response
    const itineraryResult = parseItineraryResponse(text);
    
    console.log("Successfully generated itinerary with", 
      itineraryResult.schedule.length, "days,",
      itineraryResult.packingList.length, "packing categories, and",
      itineraryResult.localTips.length, "local tips");
    
    return NextResponse.json({ data: itineraryResult });
    
  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    
    const errorMessage = error.message || "Unknown error";
    const statusCode = 
      errorMessage.includes("not configured") ? 500 :
      errorMessage.includes("rate limit") ? 429 : 500;
    
    return NextResponse.json(
      { 
        error: "Failed to generate itinerary", 
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}
