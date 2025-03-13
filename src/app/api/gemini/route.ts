import { NextResponse } from 'next/server';
import axios from 'axios';

// Use Edge Runtime for improved performance
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Get API key from environment variable
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      console.error("GEMINI_API_KEY is not defined");
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Parse request body
    const { question, itineraryData } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    console.log("Processing question with itinerary context:", question);
    
    // Direct API call to Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
    
    // Prepare the prompt with itinerary context
    const prompt = `
      You are a travel assistant helping a user with their trip to ${itineraryData?.destination || "their destination"}.
      
      Itinerary Information:
      ${itineraryData ? `
      - Destination: ${itineraryData.destination}
      - Duration: ${itineraryData.schedule?.length || 'Unknown'} days
      - Summary: ${itineraryData.summary || 'Not provided'}
      ` : 'No specific itinerary details provided.'}
      
      The user asks: "${question}"
      
      Provide a helpful response that's specific to their travel needs.
    `;
    
    // Prepare the request payload with proper format
    const payload = {
      contents: [{ 
        role: "user",
        parts: [{ text: prompt }] 
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };
    
    // Add query param after URL construction
    const url = new URL(apiUrl);
    url.searchParams.append('key', API_KEY);
    
    console.log("Making request to:", url.toString().replace(API_KEY, '[REDACTED]'));
    
    // Make the API call with fetch
    const geminiResponse = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("Gemini API error response:", errorData);
      throw new Error(errorData?.error?.message || "Failed to get response from Gemini");
    }
    
    const data = await geminiResponse.json();
    
    // Extract the response text using the correct path
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "Sorry, I couldn't generate a response";
    
    console.log("Successfully received response from Gemini API");
    return NextResponse.json({ answer: responseText }, { status: 200 });
    
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request with Gemini API', 
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
