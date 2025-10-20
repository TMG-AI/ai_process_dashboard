import { NextResponse } from 'next/server';
import { getUserProjects, getUserDebugLogs, getUserTimeLogs } from '@/lib/redis/helpers';

// Temporary: For local testing
const TEMP_USER_ID = 'user_local_dev';

function getDateRange(period: string): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  const end = now;
  let start: Date;
  let prevStart: Date;
  let prevEnd: Date;

  if (period === 'week') {
    // This week (last 7 days)
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    prevEnd = new Date(start.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === 'month') {
    // This month (last 30 days)
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    prevEnd = new Date(start.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    // All time - no filtering
    start = new Date(0);
    prevStart = new Date(0);
    prevEnd = new Date(0);
  }

  return { start, end, prevStart, prevEnd };
}

function filterByDateRange<T>(items: T[], dateField: keyof T, start: Date, end: Date): T[] {
  return items.filter(item => {
    const dateValue = item[dateField];
    if (typeof dateValue === 'string') {
      const itemDate = new Date(dateValue);
      return itemDate >= start && itemDate <= end;
    }
    return false;
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // week, month, all

    // Get all data
    const allProjects = await getUserProjects(TEMP_USER_ID);
    const allDebugLogs = await getUserDebugLogs(TEMP_USER_ID);
    const allTimeLogs = await getUserTimeLogs(TEMP_USER_ID);

    const { start, end, prevStart, prevEnd } = getDateRange(period);

    // Filter data by date range (using updatedAt for projects, startedAt for logs)
    const projects = period === 'all'
      ? allProjects
      : filterByDateRange(allProjects, 'updatedAt', start, end);

    const debugLogs = period === 'all'
      ? allDebugLogs
      : filterByDateRange(allDebugLogs, 'createdAt', start, end);

    const timeLogs = period === 'all'
      ? allTimeLogs
      : filterByDateRange(allTimeLogs, 'startedAt', start, end);

    // Previous period data for trends (only if not 'all')
    const prevTimeLogs = period === 'all'
      ? []
      : filterByDateRange(allTimeLogs, 'startedAt', prevStart, prevEnd);

    // Calculate current period metrics
    const totalBuildingHours = timeLogs
      .filter(t => t.timerType === 'building')
      .reduce((sum, t) => sum + ((t.durationMinutes || 0) / 60), 0);

    const totalDebuggingHours = timeLogs
      .filter(t => t.timerType === 'debugging')
      .reduce((sum, t) => sum + ((t.durationMinutes || 0) / 60), 0);

    const totalHours = totalBuildingHours + totalDebuggingHours;

    console.log('📊 ANALYTICS API: Data Summary', {
      period,
      totalProjects: projects.length,
      totalTimeLogs: timeLogs.length,
      totalBuildingHours: totalBuildingHours.toFixed(2),
      totalDebuggingHours: totalDebuggingHours.toFixed(2),
      totalHours: totalHours.toFixed(2),
    });

    // Previous period metrics for comparison
    const prevBuildingHours = prevTimeLogs
      .filter(t => t.timerType === 'building')
      .reduce((sum, t) => sum + ((t.durationMinutes || 0) / 60), 0);

    const prevDebuggingHours = prevTimeLogs
      .filter(t => t.timerType === 'debugging')
      .reduce((sum, t) => sum + ((t.durationMinutes || 0) / 60), 0);

    const prevTotalHours = prevBuildingHours + prevDebuggingHours;

    // Calculate trend percentage
    const hoursTrend = prevTotalHours > 0
      ? Math.round(((totalHours - prevTotalHours) / prevTotalHours) * 100)
      : 0;

    // Completion metrics
    const completedProjects = projects.filter(p => p.status === 'complete').length;
    const totalProjects = projects.length;
    const completionRate = totalProjects > 0
      ? Math.round((completedProjects / totalProjects) * 100)
      : 0;

    // Average debug time from debug logs
    const avgDebugTime = debugLogs.length > 0
      ? Math.round(debugLogs.reduce((sum, log) => sum + (log.timeSpentMinutes || 0), 0) / debugLogs.length)
      : 0;

    // Building vs Debugging ratio
    const buildingRatio = totalHours > 0
      ? Math.round((totalBuildingHours / totalHours) * 100)
      : 0;
    const debuggingRatio = totalHours > 0
      ? Math.round((totalDebuggingHours / totalHours) * 100)
      : 0;

    // Project breakdown for performance section
    const projectPerformance = projects.map(p => ({
      id: p.id,
      name: p.name,
      buildingHours: p.buildingHours || 0,
      debuggingHours: p.debuggingHours || 0,
      totalHours: (p.buildingHours || 0) + (p.debuggingHours || 0),
      debugRatio: ((p.buildingHours || 0) + (p.debuggingHours || 0)) > 0
        ? Math.round(((p.debuggingHours || 0) / ((p.buildingHours || 0) + (p.debuggingHours || 0))) * 100)
        : 0,
      status: p.status,
    })).sort((a, b) => b.totalHours - a.totalHours);

    // Chart data - daily breakdown for last 7/30 days
    const chartData = [];
    const daysToShow = period === 'week' ? 7 : period === 'month' ? 30 : 14; // 14 days for 'all'

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(end.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const dayTimeLogs = timeLogs.filter(log => {
        const logDate = new Date(log.startedAt).toISOString().split('T')[0];
        return logDate === dateStr;
      });

      const dayBuilding = dayTimeLogs
        .filter(t => t.timerType === 'building')
        .reduce((sum, t) => sum + ((t.durationMinutes || 0) / 60), 0);

      const dayDebugging = dayTimeLogs
        .filter(t => t.timerType === 'debugging')
        .reduce((sum, t) => sum + ((t.durationMinutes || 0) / 60), 0);

      chartData.push({
        date: dateStr,
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        building: Math.round(dayBuilding * 10) / 10,
        debugging: Math.round(dayDebugging * 10) / 10,
      });
    }

    const analytics = {
      totalHours: Math.round(totalHours * 10) / 10,
      hoursTrend: period === 'all' ? null : hoursTrend,
      buildingRatio,
      debuggingRatio,
      completionRate,
      avgDebugTime,
      projectPerformance,
      chartData,
      period,
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
