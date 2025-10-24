import { NextResponse } from 'next/server';
import { listAvailableModels } from '@/lib/gemini';

// Optional: mark as dynamic so it doesn't get cached at build time
export const dynamic = 'force-dynamic';

export async function GET() {
	try {
		const models = await listAvailableModels();
		return NextResponse.json({ models });
	} catch (error: any) {
		return NextResponse.json(
			{ error: 'Failed to list models', details: error?.message || String(error) },
			{ status: 500 }
		);
	}
}
