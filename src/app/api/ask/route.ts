import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Get the question and itinerary data from the request body
    const { question, itineraryData } = await request.json();
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    console.log('Processing question with itinerary context:', question);

    // Initialize the API
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Create a prompt that includes the itinerary context
    const contextualPrompt = `
      You are a travel assistant helping a user with their itinerary to ${itineraryData.destination}.
      
      Itinerary Information:
      - Destination: ${itineraryData.destination}
      - Duration: ${itineraryData.schedule?.length || 'Unknown'} days
      - Summary: ${itineraryData.summary || 'Not provided'}
      
      The user asks: "${question}"
      
      Provide a helpful response that's specific to their itinerary details. If the answer isn't specifically in the itinerary, provide general travel advice about their destination.
    `;

  // Use MODEL_NAME env (fallback to gemini-pro). If a model isn't available you'll get an error
  // indicating you should list available models and set MODEL_NAME accordingly.
  const MODEL_NAME = process.env.MODEL_NAME || 'gemini-2.0-flash-lite';
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Generate content with the contextual prompt
    let result;
    try {
      result = await model.generateContent(contextualPrompt);
    } catch (err: any) {
      console.error('Error from generative API:', err);
      const msg = err?.message || String(err);
      if (msg.includes('not found') || msg.includes('NOT_FOUND')) {
        return NextResponse.json({ error: `Model ${MODEL_NAME} not found or unsupported for generateContent. Set MODEL_NAME to a supported model.` }, { status: 404 });
      }
      throw err;
    }
    const text = result.response.text();

    console.log('Generated contextual response successfully');
    return NextResponse.json({ answer: text }, { status: 200 });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
