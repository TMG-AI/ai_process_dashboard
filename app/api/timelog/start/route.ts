import { NextRequest, NextResponse } from 'next/server';
import { createTimeLog } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

// POST /api/timelog/start - Start a new time log
export async function POST(request: NextRequest) {
  try {
    const { projectId, timerType } = await request.json();

    const timeLog = await createTimeLog({
      projectId,
      userId: TEMP_USER_ID,
      timerType,
      startedAt: new Date().toISOString(),
    });

    return NextResponse.json({ timeLog }, { status: 201 });
  } catch (error) {
    console.error('Error starting time log:', error);
    return NextResponse.json(
      { error: 'Failed to start time log' },
      { status: 500 }
    );
  }
}
