import { NextResponse } from 'next/server';
import { getUserDebugLogs } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

export async function GET() {
  try {
    // Get all debug logs for the user
    const debugLogs = await getUserDebugLogs(TEMP_USER_ID);

    return NextResponse.json({ debugLogs });
  } catch (error) {
    console.error('Error fetching debug logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug logs' },
      { status: 500 }
    );
  }
}
