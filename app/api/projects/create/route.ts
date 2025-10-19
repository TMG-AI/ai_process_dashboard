import { NextRequest, NextResponse } from 'next/server';
import { createProject, getActiveProjectCount } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

export async function POST(request: NextRequest) {
  try {
    const userId = TEMP_USER_ID;

    // Check active project limit
    const activeCount = await getActiveProjectCount(userId);
    if (activeCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum 3 active projects allowed. Please pause or complete a project first.' },
        { status: 400 }
      );
    }

    const projectData = await request.json();

    const project = await createProject(userId, projectData);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
