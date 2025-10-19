import { NextRequest, NextResponse } from 'next/server';
import { createProject, getUserProjects } from '@/lib/redis/helpers';

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

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const project = await createProject(TEMP_USER_ID, {
      name: body.name,
      description: body.description,
      problemStatement: body.problemStatement,
      targetUser: body.targetUser,
      mvpScope: body.mvpScope,
      outOfScope: body.outOfScope,
      status: body.status || 'planning',
      platform: body.platform,
      priority: body.priority || 'medium',
      estimatedHours: body.estimatedHours,
      buildingHours: 0,
      debuggingHours: 0,
      progress: 0,
      potentialRisks: body.potentialRisks,
      mitigationStrategy: body.mitigationStrategy,
      nextAction: body.nextAction,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project. Make sure your Redis credentials are set in .env.local' },
      { status: 500 }
    );
  }
}
