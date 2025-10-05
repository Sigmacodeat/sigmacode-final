import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

// Analytics data types
interface AnalyticsEvent {
  type: 'performance' | 'error' | 'custom';
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
  url?: string;
  userAgent?: string;
  severity?: string;
  stack?: string;
  message?: string; // Add message property
}

// In-memory storage for development (use database in production)
let analyticsData: AnalyticsEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body as { events: AnalyticsEvent[] };

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Add server-side metadata
    const enrichedEvents = events.map((event) => ({
      ...event,
      serverTimestamp: Date.now(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || event.userAgent || 'unknown',
      url: request.headers.get('referer') || event.url || 'unknown',
    }));

    // Store in memory (for development)
    analyticsData.push(...enrichedEvents);

    // Keep only last 10000 events in memory
    if (analyticsData.length > 10000) {
      analyticsData = analyticsData.slice(-10000);
    }

    // In production, save to database or external service
    if (process.env.NODE_ENV === 'production') {
      await saveToDatabase(enrichedEvents);
    }

    // Log summary for monitoring
    console.log(
      `📊 Analytics: ${events.length} events received (${events[0]?.type || 'unknown'} type)`,
    );

    return NextResponse.json({
      success: true,
      received: events.length,
      total: analyticsData.length,
    });
  } catch (error: unknown) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint for dashboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const since = searchParams.get('since');

    let filteredData = analyticsData;

    // Filter by type
    if (type) {
      filteredData = filteredData.filter((event) => event.type === type);
    }

    // Filter by date
    if (since) {
      const sinceDate = new Date(since).getTime();
      filteredData = filteredData.filter((event) => event.timestamp >= sinceDate);
    }

    // Sort by timestamp (newest first)
    filteredData.sort((a, b) => b.timestamp - a.timestamp);

    // Limit results
    filteredData = filteredData.slice(0, limit);

    // Generate summary statistics
    const summary = {
      total: analyticsData.length,
      filtered: filteredData.length,
      types: {
        performance: analyticsData.filter((e) => e.type === 'performance').length,
        error: analyticsData.filter((e) => e.type === 'error').length,
        custom: analyticsData.filter((e) => e.type === 'custom').length,
      },
      recentErrors: analyticsData
        .filter((e) => e.type === 'error')
        .slice(0, 5)
        .map((e) => ({
          message: e.metadata?.message || e.message || 'Unknown error',
          url: e.url,
          timestamp: e.timestamp,
        })),
    };

    return NextResponse.json({
      events: filteredData,
      summary,
    });
  } catch (error: unknown) {
    console.error('Analytics GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Save to database (production implementation)
async function saveToDatabase(events: AnalyticsEvent[]): Promise<void> {
  try {
    // In production, implement database storage (PostgreSQL, MongoDB, etc.)
    // For now, save to JSON file as backup

    const dataDir = join(process.cwd(), 'data');
    const analyticsFile = join(dataDir, 'analytics.json');

    // Ensure data directory exists
    await mkdir(dataDir, { recursive: true });

    // Append to existing data or create new file (ohne dynamischen Import)
    let existingData: AnalyticsEvent[] = [];
    try {
      const buf = await readFile(analyticsFile, 'utf8');
      existingData = JSON.parse(buf) || [];
    } catch {
      // File doesn't exist or invalid JSON, start fresh
    }

    const allData = [...existingData, ...events];
    const recentData = allData.slice(-50000); // Keep last 50k events

    await writeFile(analyticsFile, JSON.stringify(recentData, null, 2));
  } catch (error: unknown) {
    console.error('Failed to save analytics to database:', error);
    // Don't throw - analytics should not break the app
  }
}
