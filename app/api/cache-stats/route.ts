import { NextResponse } from 'next/server';

// Simple mock endpoint used by AutoOptimizer.getCacheHitRate()
// Replace with real cache metrics if/when available
export async function GET() {
  const payload = {
    hitRate: 0.0,
    generatedAt: new Date().toISOString(),
  };
  return NextResponse.json(payload, { status: 200 });
}
