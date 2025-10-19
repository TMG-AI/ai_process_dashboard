import { NextRequest, NextResponse } from 'next/server';
import { updateProject } from '@/lib/redis/helpers';

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    console.log('🔵 API: Pausing project:', projectId);

    const updatedProject = await updateProject(projectId, {
      status: 'paused',
    });

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('✅ API: Project paused:', updatedProject);

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error('❌ API: Error pausing project:', error);
    return NextResponse.json(
      { error: 'Failed to pause project' },
      { status: 500 }
    );
  }
}
