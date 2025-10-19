import { NextRequest, NextResponse } from 'next/server';
import { updateTimeLog, getProject, updateProject } from '@/lib/redis/helpers';

// POST /api/timelog/stop - Stop a time log and update project hours
export async function POST(request: NextRequest) {
  try {
    const { timeLogId, projectId, timerType, elapsedMinutes } = await request.json();

    // Update time log with end time and duration
    const updatedTimeLog = await updateTimeLog(timeLogId, {
      endedAt: new Date().toISOString(),
      durationMinutes: elapsedMinutes,
    });

    if (!updatedTimeLog) {
      return NextResponse.json(
        { error: 'Time log not found' },
        { status: 404 }
      );
    }

    // Update project hours
    const project = await getProject(projectId);
    if (project) {
      const hoursToAdd = elapsedMinutes / 60;
      const updates = timerType === 'building'
        ? { buildingHours: project.buildingHours + hoursToAdd }
        : { debuggingHours: project.debuggingHours + hoursToAdd };

      await updateProject(projectId, updates);
    }

    return NextResponse.json({ success: true, timeLog: updatedTimeLog });
  } catch (error) {
    console.error('Error stopping time log:', error);
    return NextResponse.json(
      { error: 'Failed to stop time log' },
      { status: 500 }
    );
  }
}
