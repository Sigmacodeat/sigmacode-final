import { NextRequest, NextResponse } from 'next/server';

type RecordsAffected = {
  profile: number;
  activities: number;
  consents: number;
  files: number;
  account?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, deleteType = 'soft' } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (!['soft', 'hard'].includes(deleteType)) {
      return NextResponse.json({ error: 'deleteType must be "soft" or "hard"' }, { status: 400 });
    }

    // Mock deletion process - replace with actual database operations
    const deletionSummary = {
      userId,
      deleteType,
      processedAt: new Date().toISOString(),
      actions: [
        'User profile data removed',
        'Activity logs anonymized',
        'Consent records cleared',
        'Associated files deleted',
      ],
      recordsAffected: {
        profile: 1,
        activities: 5,
        consents: 2,
        files: 3,
      } as RecordsAffected,
    };

    if (deleteType === 'hard') {
      deletionSummary.actions.push('Complete account removal');
      deletionSummary.recordsAffected = {
        profile: 1,
        activities: 5,
        consents: 2,
        files: 3,
        account: 1,
      };
    }

    return NextResponse.json({
      success: true,
      deletionSummary,
      warning:
        deleteType === 'hard'
          ? 'This action cannot be undone. All data has been permanently removed.'
          : 'Data has been anonymized but may still exist in backups.',
    });
  } catch (error: any) {
    console.error('GDPR deletion error:', error);
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
