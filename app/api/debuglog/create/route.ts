import { NextRequest, NextResponse } from 'next/server';
import { createDebugLog } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

export async function POST(request: NextRequest) {
  try {
    const { projectId, attempts, hypothesis, timeSpentMinutes } = await request.json();

    console.log('🔵 API: Creating debug log', { projectId, attempts, hypothesis, timeSpentMinutes });

    const debugLog = await createDebugLog({
      projectId,
      userId: TEMP_USER_ID,
      attempts: [
        {
          attempt: attempts,
          timestamp: new Date().toISOString(),
        }
      ],
      hypothesis,
      timeSpentMinutes,
    });

    console.log('✅ API: Debug log created:', debugLog);

    return NextResponse.json({ debugLog });
  } catch (error) {
    console.error('❌ API: Error creating debug log:', error);
    return NextResponse.json(
      { error: 'Failed to create debug log' },
      { status: 500 }
    );
  }
}
