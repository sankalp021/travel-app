import { NextRequest } from "next/server";
import { buildItineraryPrompt } from "@/lib/itineraryPrompt";
import { UserSelections } from "@/lib/types";
import axios from 'axios';

// Use Edge Runtime for improved performance with streaming
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const userSelections: UserSelections = await request.json();
    
    // Create a new ReadableStream to stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build the prompt for Gemini API
          const promptText = buildItineraryPrompt(userSelections);
          
          // Get API key
          const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
          if (!API_KEY) {
            throw new Error("Gemini API key is not configured");
          }
          
          // Construct API URL - Use Gemini 1.5 Flash for faster response
          const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`;
          
          // Build payload
          const payload = {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.4,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192
            }
          };
          
          // Make the API call
          const response = await axios({
            url: apiUrl,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            params: { key: API_KEY },
            data: payload
          });
          
          // Extract the text response and parse JSON
          const text = response.data.candidates[0].content.parts[0].text;
          const jsonMatch = text.match(/{[\s\S]*}/);
          
          if (!jsonMatch) {
            throw new Error("Invalid response format");
          }
          
          const itineraryResult = JSON.parse(jsonMatch[0]);
          
          // Send only the final result
          controller.enqueue(encoder.encode(JSON.stringify(itineraryResult)));
          
          // Close the stream
          controller.close();
        } catch (error: any) {
          // Send error message to client
          controller.enqueue(encoder.encode(JSON.stringify({
            error: error.message || "Failed to generate itinerary"
          })));
          controller.close();
        }
      }
    });
    
    // Return a streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error: any) {
    // Handle initial errors before streaming begins
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Text encoder for the stream
const encoder = new TextEncoder();
