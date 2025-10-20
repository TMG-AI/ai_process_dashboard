import { NextResponse } from 'next/server';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

export async function POST(request: Request) {
  try {
    const startedAt = new Date().toISOString();

    return NextResponse.json({
      startedAt,
      message: 'Learning timer started'
    });
  } catch (error) {
    console.error('Error starting learning timer:', error);
    return NextResponse.json(
      { error: 'Failed to start learning timer' },
      { status: 500 }
    );
  }
}
