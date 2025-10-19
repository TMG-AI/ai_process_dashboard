import { NextRequest, NextResponse } from 'next/server';
import { updateTimeLog, getProject, updateProject } from '@/lib/redis/helpers';

// POST /api/timelog/stop - Stop a time log and update project hours
export async function POST(request: NextRequest) {
  try {
    const { timeLogId, projectId, timerType, elapsedMinutes } = await request.json();

    console.log('🔵 API: Stopping timer', { timeLogId, projectId, timerType, elapsedMinutes });

    // Update time log with end time and duration
    const updatedTimeLog = await updateTimeLog(timeLogId, {
      endedAt: new Date().toISOString(),
      durationMinutes: elapsedMinutes,
    });

    if (!updatedTimeLog) {
      console.error('❌ API: Time log not found:', timeLogId);
      return NextResponse.json(
        { error: 'Time log not found' },
        { status: 404 }
      );
    }

    console.log('✅ API: Time log updated:', updatedTimeLog);

    // Update project hours
    const project = await getProject(projectId);
    if (project) {
      const hoursToAdd = elapsedMinutes / 60;
      const currentBuildingHours = project.buildingHours || 0;
      const currentDebuggingHours = project.debuggingHours || 0;

      const updates = timerType === 'building'
        ? { buildingHours: currentBuildingHours + hoursToAdd }
        : { debuggingHours: currentDebuggingHours + hoursToAdd };

      console.log('📊 API: Updating project hours', {
        projectId,
        timerType,
        currentBuildingHours,
        currentDebuggingHours,
        hoursToAdd,
        newHours: updates
      });

      const updatedProject = await updateProject(projectId, updates);
      console.log('✅ API: Project updated:', updatedProject);
    } else {
      console.error('❌ API: Project not found:', projectId);
    }

    return NextResponse.json({ success: true, timeLog: updatedTimeLog });
  } catch (error) {
    console.error('❌ API: Error stopping time log:', error);
    return NextResponse.json(
      { error: 'Failed to stop time log' },
      { status: 500 }
    );
  }
}
