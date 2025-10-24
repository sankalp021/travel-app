import { NextRequest, NextResponse } from "next/server";
import { fetchDestinationData } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();
    
    if (!destination) {
      return NextResponse.json(
        { error: "Destination is required" },
        { status: 400 }
      );
    }

    // Keep this endpoint focused only on fetching destination info to minimize latency.

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
