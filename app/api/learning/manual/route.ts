import { NextResponse } from 'next/server';
import { createLearningLog } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

export async function POST(request: Request) {
  try {
    const { sources, otherSource, topic, description, durationMinutes, date } = await request.json();

    // Use provided date or current date
    const startedAt = date || new Date().toISOString();

    const learningLog = await createLearningLog({
      userId: TEMP_USER_ID,
      sources: sources || [],
      otherSource,
      topic,
      description,
      startedAt,
      durationMinutes,
      isManual: true,
    });

    return NextResponse.json({ learningLog });
  } catch (error) {
    console.error('Error creating manual learning log:', error);
    return NextResponse.json(
      { error: 'Failed to create manual learning log' },
      { status: 500 }
    );
  }
}
