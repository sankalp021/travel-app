import { NextRequest, NextResponse } from "next/server";
import { fetchDestinationData, listAvailableModels } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();
    
    if (!destination) {
      return NextResponse.json(
        { error: "Destination is required" },
        { status: 400 }
      );
    }

    // Optionally list models for debugging. Disabled by default to avoid
    // doubling latency (which can contribute to timeouts in serverless).
    if (process.env.DEBUG_LIST_MODELS === 'true') {
      try {
        console.log("Checking available models...");
        const models = await listAvailableModels();
        console.log(`Found ${models.length} available models`);
      } catch (modelError) {
        console.error("Failed to list models:", modelError);
        // Continue anyway, the main function will handle errors
      }
    }

    const data = await fetchDestinationData(destination);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Error in destination API route:", error);
    
    // More detailed error response
    const errorMessage = error.message || "Unknown error";
    const statusCode = 
      errorMessage.includes("not configured") ? 500 :
      errorMessage.includes("rate limit") ? 429 : 
      500;
    
    return NextResponse.json(
      { 
        error: "Failed to fetch destination data", 
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}
