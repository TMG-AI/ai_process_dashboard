import { NextResponse } from 'next/server';
import { getUserProjects } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

export async function GET() {
  try {
    // Get all projects for the user
    const projects = await getUserProjects(TEMP_USER_ID);

    // Calculate analytics
    const totalBuildingHours = projects.reduce((sum, p) => sum + (p.buildingHours || 0), 0);
    const totalDebuggingHours = projects.reduce((sum, p) => sum + (p.debuggingHours || 0), 0);
    const totalHours = totalBuildingHours + totalDebuggingHours;

    const completedProjects = projects.filter(p => p.status === 'complete').length;
    const totalProjects = projects.length;

    const analytics = {
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      buildingRatio: totalHours > 0 ? Math.round((totalBuildingHours / totalHours) * 100) : 0,
      debuggingRatio: totalHours > 0 ? Math.round((totalDebuggingHours / totalHours) * 100) : 0,
      completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
      avgDebugTime: 0, // Would need debug log data
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
