import { NextResponse } from 'next/server';
import { getUserProjects } from '@/lib/redis/helpers';

// Temporary: For local testing, we'll use a fixed user ID
// In production, this will come from authentication
const TEMP_USER_ID = 'user_local_dev';

// GET /api/projects - Get all projects for the user
export async function GET() {
  try {
    const projects = await getUserProjects(TEMP_USER_ID);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects. Make sure your Redis credentials are set in .env.local' },
      { status: 500 }
    );
  }
}

// POST endpoint removed - use /api/projects/create instead
// The /api/projects/create endpoint enforces the 3-project limit
