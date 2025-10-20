import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis/client';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

async function clearData() {
  try {
    console.log('🗑️ CLEARING ALL DATA for user:', TEMP_USER_ID);

    // Get all keys for this user
    const projectsKey = `user:${TEMP_USER_ID}:projects`;
    const timeLogsKey = `user:${TEMP_USER_ID}:timelogs`;
    const debugLogsKey = `user:${TEMP_USER_ID}:debuglogs`;
    const learningLogsKey = `user:${TEMP_USER_ID}:learninglogs`;
    const requestsKey = `user:${TEMP_USER_ID}:requests`;

    // Delete all data
    await Promise.all([
      redis.del(projectsKey),
      redis.del(timeLogsKey),
      redis.del(debugLogsKey),
      redis.del(learningLogsKey),
      redis.del(requestsKey),
    ]);

    console.log('✅ ALL DATA CLEARED - Starting fresh with zeros');

    return NextResponse.json({
      success: true,
      message: 'All data cleared successfully. You now have a clean slate!',
    });
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}

// Support both GET and POST
export async function GET() {
  return clearData();
}

export async function POST() {
  return clearData();
}
