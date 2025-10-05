import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    // Mock user data - replace with actual database queries
    const userData = {
      id: userId,
      email: `user${userId}@example.com`,
      name: `User ${userId}`,
      createdAt: new Date().toISOString(),
      profile: {
        avatar: null,
        bio: 'Sample bio',
        preferences: { theme: 'light', language: 'en' },
      },
      activities: [
        { id: '1', action: 'login', timestamp: new Date().toISOString() },
        { id: '2', action: 'update_profile', timestamp: new Date().toISOString() },
      ],
      consents: [
        { type: 'marketing', granted: true, timestamp: new Date().toISOString() },
        { type: 'analytics', granted: false, timestamp: new Date().toISOString() },
      ],
      exportedAt: new Date().toISOString(),
      formatVersion: '1.0',
    };

    // Create export file
    const exportData = {
      metadata: {
        userId,
        exportedAt: new Date().toISOString(),
        dataTypes: ['profile', 'activities', 'consents'],
        totalRecords: 1,
      },
      data: userData,
    };

    const filename = `gdpr-export-${userId}-${Date.now()}.json`;
    const tempPath = path.join(process.cwd(), 'tmp', filename);

    // Ensure tmp directory exists
    await fs.mkdir(path.join(process.cwd(), 'tmp'), { recursive: true });

    // Write file
    await fs.writeFile(tempPath, JSON.stringify(exportData, null, 2));

    // Return file URL or content
    return NextResponse.json({
      success: true,
      downloadUrl: `/api/gdpr/export/download?file=${filename}`,
      summary: {
        recordsExported: 1,
        dataTypes: ['profile', 'activities', 'consents'],
        fileSize: JSON.stringify(exportData).length,
      },
    });
  } catch (error: any) {
    console.error('GDPR export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
