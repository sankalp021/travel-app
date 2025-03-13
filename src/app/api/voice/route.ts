import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ELEVEN_LABS;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }
    
    // Get the text to speak from request body
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text to speak is required' }, { status: 400 });
    }
    
    // Use Mimic for travel guide voice - you can change to another voice ID if preferred
    // Some other good voice options: "21m00Tcm4TlvDq8ikWAM" (Rachel), "D38z5RcWu1voky8WS1ja" (Thomas)
    const voiceId = "MF3mGyEYCl7XYWbV9V6O"; // Using "Elli" voice which is good for travel guides
    
    // ElevenLabs API endpoint for text-to-speech
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        }
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.detail?.message || 'Error generating speech');
    }

    // Get the audio data as an ArrayBuffer
    const audioData = await response.arrayBuffer();
    
    // Return the audio file
    return new Response(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
