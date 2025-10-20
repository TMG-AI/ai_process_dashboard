import { NextResponse } from 'next/server';
import { createLearningLog } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

export async function POST(request: Request) {
  try {
    const { startedAt, sources, otherSource, topic, description } = await request.json();

    const endedAt = new Date().toISOString();
    const durationMinutes = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000);

    const learningLog = await createLearningLog({
      userId: TEMP_USER_ID,
      sources: sources || [],
      otherSource,
      topic,
      description,
      startedAt,
      endedAt,
      durationMinutes,
      isManual: false,
    });

    return NextResponse.json({ learningLog });
  } catch (error) {
    console.error('Error stopping learning timer:', error);
    return NextResponse.json(
      { error: 'Failed to stop learning timer' },
      { status: 500 }
    );
  }
}
