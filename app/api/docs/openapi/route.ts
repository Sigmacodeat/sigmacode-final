import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const root = process.cwd();
    const specPath = path.join(root, 'openapi-spec.yaml');
    const data = await fs.readFile(specPath, 'utf-8');
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/yaml; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'OpenAPI spec not found', details: err?.message },
      { status: 404 },
    );
  }
}
