import { NextRequest, NextResponse } from 'next/server';
import { createTimeLog, updateTimeLog } from '@/lib/redis/helpers';

const TEMP_USER_ID = 'user_local_dev';

// POST /api/timelogs - Create or update a time log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If updating an existing log (stopping the timer)
    if (body.timeLogId && body.endedAt) {
      const timeLog = await updateTimeLog(body.timeLogId, {
        endedAt: body.endedAt,
        durationMinutes: body.durationMinutes,
        notes: body.notes,
      });
      return NextResponse.json({ timeLog });
    }

    // Creating a new log (starting the timer)
    const timeLog = await createTimeLog({
      projectId: body.projectId,
      userId: TEMP_USER_ID,
      timerType: body.timerType,
      startedAt: body.startedAt || new Date().toISOString(),
      notes: body.notes,
    });

    return NextResponse.json({ timeLog }, { status: 201 });
  } catch (error) {
    console.error('Error with time log:', error);
    return NextResponse.json(
      { error: 'Failed to manage time log' },
      { status: 500 }
    );
  }
}
