import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';

// Disable static optimization for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = parseInt(searchParams.get('period') || '60'); // minutes
    const includeHealth = searchParams.get('health') === 'true';

    const metrics = await performanceMonitor.getMetricsAPI();

    const response: any = {
      current: metrics.current,
      summary: metrics.summary,
      history: metrics.history,
    };

    if (includeHealth) {
      response.health = metrics.health;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch performance metrics' }, { status: 500 });
  }
}
