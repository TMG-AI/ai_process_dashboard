import { NextRequest, NextResponse } from 'next/server';
import { createProject, getActiveProjectCount, getTotalProjectCount } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

// Project limits
const MAX_TOTAL_PROJECTS = 5; // Total active + paused projects
const MAX_ACTIVE_PROJECTS = 3; // Active projects only

export async function POST(request: NextRequest) {
  try {
    const userId = TEMP_USER_ID;

    // Check total project limit (active + paused, excluding completed)
    const totalCount = await getTotalProjectCount(userId);
    if (totalCount >= MAX_TOTAL_PROJECTS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_TOTAL_PROJECTS} total projects allowed (active + paused). Please complete a project first.` },
        { status: 400 }
      );
    }

    // Check active project limit
    const activeCount = await getActiveProjectCount(userId);
    if (activeCount >= MAX_ACTIVE_PROJECTS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ACTIVE_PROJECTS} active projects allowed. Please pause or complete a project first.` },
        { status: 400 }
      );
    }

    const projectData = await request.json();
    console.log('🔵 API: Creating project with data:', projectData);

    const project = await createProject(userId, projectData);
    console.log('✅ API: Project created:', project);

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('❌ API: Error creating project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
      { status: 500 }
    );
  }
}
