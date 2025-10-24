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

    const errorMessage = error.message || "Unknown error";
    let statusCode = 500;

    if (errorMessage.includes('not configured')) statusCode = 500;
    else if (errorMessage.includes('rate limit')) statusCode = 429;
    else if (errorMessage.toLowerCase().includes('timed out') || errorMessage.toLowerCase().includes('timeout')) statusCode = 504;

    return NextResponse.json(
      {
        error: "Failed to fetch destination data",
        details: errorMessage
      },
      { status: statusCode }
    );
  }
}
