import { NextResponse } from 'next/server';
import { getUserProjects, getUserDebugLogs, getUserTimeLogs, getUserLearningLogs } from '@/lib/redis/helpers';

const TEMP_USER_ID = 'user_local_dev';

export async function GET() {
  try {
    const projects = await getUserProjects(TEMP_USER_ID);
    const timeLogs = await getUserTimeLogs(TEMP_USER_ID);
    const debugLogs = await getUserDebugLogs(TEMP_USER_ID);
    const learningLogs = await getUserLearningLogs(TEMP_USER_ID);

    return NextResponse.json({
      projects: {
        count: projects.length,
        data: projects,
      },
      timeLogs: {
        count: timeLogs.length,
        data: timeLogs,
      },
      debugLogs: {
        count: debugLogs.length,
        data: debugLogs,
      },
      learningLogs: {
        count: learningLogs.length,
        data: learningLogs,
      },
      totalRecords: projects.length + timeLogs.length + debugLogs.length + learningLogs.length,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: String(error) },
      { status: 500 }
    );
  }
}
