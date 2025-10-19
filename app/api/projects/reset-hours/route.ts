import { NextResponse } from 'next/server';
import { getUserProjects, updateProject } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

// POST /api/projects/reset-hours - Reset all project hours to zero
export async function POST() {
  try {
    const projects = await getUserProjects(TEMP_USER_ID);

    console.log(`🔄 Resetting hours for ${projects.length} projects...`);

    // Reset all projects to zero hours
    const updates = await Promise.all(
      projects.map(project =>
        updateProject(project.id, {
          buildingHours: 0,
          debuggingHours: 0,
        })
      )
    );

    console.log(`✅ Reset complete! All project hours set to 0`);

    return NextResponse.json({
      success: true,
      message: `Reset ${projects.length} projects to zero hours`,
      projects: updates.filter(p => p !== null)
    });
  } catch (error) {
    console.error('❌ Error resetting hours:', error);
    return NextResponse.json(
      { error: 'Failed to reset hours' },
      { status: 500 }
    );
  }
}
