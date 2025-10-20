import { NextResponse } from 'next/server';
import { getUserLearningLogs, getTotalLearningHours } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

export async function GET() {
  try {
    const learningLogs = await getUserLearningLogs(TEMP_USER_ID);
    const totalHours = await getTotalLearningHours(TEMP_USER_ID);

    return NextResponse.json({
      learningLogs,
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    console.error('Error fetching learning logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning logs' },
      { status: 500 }
    );
  }
}
