import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('file');

    if (!filename) {
      return NextResponse.json({ error: 'file parameter is required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'tmp', filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found or expired' }, { status: 404 });
    }

    // Read and return file
    const content = await fs.readFile(filePath, 'utf-8');

    // Clean up file after sending
    await fs.unlink(filePath).catch(() => {});

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('GDPR download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
