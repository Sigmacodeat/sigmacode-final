import { NextResponse } from 'next/server';

// Simple mock endpoint used by AutoOptimizer.getBundleSize()
// In a real setup, wire this to your build metrics or bundle analyzer output
export async function GET() {
  const payload = {
    size: 0, // bytes; replace with real bundle size if available
    generatedAt: new Date().toISOString(),
  };
  return NextResponse.json(payload, { status: 200 });
}
