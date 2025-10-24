import { NextRequest } from "next/server";
import { buildSchedulePrompt, buildBudgetPrompt, buildTipsPrompt, mergeItineraryParts } from "@/lib/itineraryPrompt";
import { UserSelections } from "@/lib/types";
import axios from 'axios';

// Use Edge Runtime for improved performance
export const runtime = 'edge';
export const maxDuration = 60; // 60 seconds

async function callGeminiAPI(prompt: string, temperature: number = 0.3, maxTokens: number = 2048) {
  const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured");
  }
  const MODEL_NAME = process.env.MODEL_NAME || 'gemini-2.0-flash';
  const API_BASE = 'https://generativelanguage.googleapis.com/v1';
  const apiUrl = `${API_BASE}/models/${MODEL_NAME}:generateContent`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: maxTokens
    }
  };
  
  const response = await axios({
    url: apiUrl,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    params: { key: API_KEY },
    data: payload
  });
  if (response.status === 404) {
    throw new Error(`Model ${MODEL_NAME} not found for this API version. Set process.env.MODEL_NAME to a supported model.`);
  }
  
  const text = response.data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/{[\s\S]*}/);
  
  if (!jsonMatch) {
    throw new Error("Invalid response format from Gemini API");
  }
  
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Failed to parse JSON from Gemini API");
  }
}

export async function POST(request: NextRequest) {
  try {
    const userSelections: UserSelections = await request.json();
    
    // Create a new ReadableStream for streaming the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Phase 1: Generate the schedule (most important part)
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "schedule", 
            message: "Generating your daily itinerary..." 
          }) + "\n"));
          
          const schedulePrompt = buildSchedulePrompt(userSelections);
          const schedulePart = await callGeminiAPI(schedulePrompt, 0.3, 2048);
          
          // Send schedule progress
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "schedule_complete", 
            data: schedulePart 
          }) + "\n"));
          
          // Phase 2: Generate the budget based on the schedule
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "budget", 
            message: "Creating your budget breakdown..." 
          }) + "\n"));
          
          const budgetPrompt = buildBudgetPrompt(userSelections, schedulePart.schedule);
          const budgetPart = await callGeminiAPI(budgetPrompt, 0.3, 1024);
          
          // Send budget progress
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "budget_complete", 
            data: budgetPart 
          }) + "\n"));
          
          // Phase 3: Generate local tips
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "tips", 
            message: "Finding local tips and recommendations..." 
          }) + "\n"));
          
          const tipsPrompt = buildTipsPrompt(userSelections);
          const tipsPart = await callGeminiAPI(tipsPrompt, 0.4, 1024);
          
          // Send tips progress
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "tips_complete", 
            data: tipsPart 
          }) + "\n"));
          
          // Phase 4: Merge all parts into a complete itinerary
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "merging", 
            message: "Finalizing your itinerary..." 
          }) + "\n"));
          
          const completeItinerary = mergeItineraryParts(schedulePart, budgetPart, tipsPart, userSelections);
          
          // Send the final result
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "complete", 
            data: completeItinerary 
          }) + "\n"));
          
          controller.close();
        } catch (error: any) {
          controller.enqueue(encoder.encode(JSON.stringify({ 
            step: "error", 
            error: error.message || "Failed to generate itinerary" 
          }) + "\n"));
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process request" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
