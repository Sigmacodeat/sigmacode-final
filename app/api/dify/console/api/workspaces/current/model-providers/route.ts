import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Hole die Dify URL aus dem Header oder Environment
    const difyUrl = req.headers.get('x-dify-url') || env.DIFY_API_URL || 'http://localhost:5001';
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Forward the request to Dify
    const response = await fetch(`${difyUrl}/console/api/workspaces/current/model-providers`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    // Return the response from Dify
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dify-url',
      },
    });
  } catch (error) {
    console.error('Dify model-providers proxy failed:', error);
    return NextResponse.json({ error: 'Dify model-providers request failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dify-url',
    },
  });
}
