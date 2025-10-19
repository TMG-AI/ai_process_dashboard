import { redis } from './client';
import { Project, TimeLog, DebugLog, ColleagueRequest, WeeklyReview } from '@/lib/types';

// Redis Key Patterns:
// user:{userId}:projects - Set of project IDs for a user
// project:{projectId} - Individual project data (JSON)
// user:{userId}:timelogs - Sorted set of time log IDs (by timestamp)
// timelog:{timelogId} - Individual time log data (JSON)
// user:{userId}:debuglogs - Set of debug log IDs
// debuglog:{debuglogId} - Individual debug log data (JSON)
// user:{userId}:requests - Set of colleague request IDs
// request:{requestId} - Individual request data (JSON)
// user:{userId}:reviews - Sorted set of review IDs (by week)
// review:{reviewId} - Individual review data (JSON)

// ===== PROJECT OPERATIONS =====

export async function createProject(userId: string, projectData: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const project: Project = {
    id: projectId,
    userId,
    ...projectData,
    buildingHours: 0,
    debuggingHours: 0,
    progress: 0,
    priority: projectData.priority || 'medium',
    status: projectData.status || 'planning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`project:${projectId}`, project);
  await redis.sadd(`user:${userId}:projects`, projectId);

  return project;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const data = await redis.get<Project>(`project:${projectId}`);
  return data;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const projectIds = await redis.smembers(`user:${userId}:projects`);
  if (!projectIds.length) return [];

  const projects = await Promise.all(
    projectIds.map(id => getProject(id as string))
  );

  return projects.filter(p => p !== null) as Project[];
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const updatedProject = {
    ...project,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`project:${projectId}`, updatedProject);
  return updatedProject;
}

export async function deleteProject(projectId: string, userId: string): Promise<void> {
  await redis.del(`project:${projectId}`);
  await redis.srem(`user:${userId}:projects`, projectId);
}

// ===== TIME LOG OPERATIONS =====

export async function createTimeLog(timeLogData: Omit<TimeLog, 'id' | 'createdAt'>): Promise<TimeLog> {
  const timeLogId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timeLog: TimeLog = {
    id: timeLogId,
    ...timeLogData,
    createdAt: new Date().toISOString(),
  };

  await redis.set(`timelog:${timeLogId}`, timeLog);
  await redis.zadd(`user:${timeLogData.userId}:timelogs`, {
    score: new Date(timeLog.startedAt).getTime(),
    member: timeLogId,
  });

  return timeLog;
}

export async function getTimeLog(timeLogId: string): Promise<TimeLog | null> {
  const data = await redis.get<TimeLog>(`timelog:${timeLogId}`);
  return data;
}

export async function getUserTimeLogs(userId: string, limit: number = 100): Promise<TimeLog[]> {
  const timeLogIds = await redis.zrange(`user:${userId}:timelogs`, 0, limit - 1, { rev: true });
  if (!timeLogIds.length) return [];

  const timeLogs = await Promise.all(
    timeLogIds.map(id => getTimeLog(id as string))
  );

  return timeLogs.filter(t => t !== null) as TimeLog[];
}

export async function updateTimeLog(timeLogId: string, updates: Partial<TimeLog>): Promise<TimeLog | null> {
  const timeLog = await getTimeLog(timeLogId);
  if (!timeLog) return null;

  const updatedTimeLog = {
    ...timeLog,
    ...updates,
  };

  await redis.set(`timelog:${timeLogId}`, updatedTimeLog);
  return updatedTimeLog;
}

// ===== DEBUG LOG OPERATIONS =====

export async function createDebugLog(debugLogData: Omit<DebugLog, 'id' | 'createdAt'>): Promise<DebugLog> {
  const debugLogId = `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const debugLog: DebugLog = {
    id: debugLogId,
    ...debugLogData,
    attempts: debugLogData.attempts || [],
    createdAt: new Date().toISOString(),
  };

  await redis.set(`debuglog:${debugLogId}`, debugLog);
  await redis.sadd(`user:${debugLogData.userId}:debuglogs`, debugLogId);

  return debugLog;
}

export async function getDebugLog(debugLogId: string): Promise<DebugLog | null> {
  const data = await redis.get<DebugLog>(`debuglog:${debugLogId}`);
  return data;
}

export async function getUserDebugLogs(userId: string): Promise<DebugLog[]> {
  const debugLogIds = await redis.smembers(`user:${userId}:debuglogs`);
  if (!debugLogIds.length) return [];

  const debugLogs = await Promise.all(
    debugLogIds.map(id => getDebugLog(id as string))
  );

  return debugLogs.filter(d => d !== null) as DebugLog[];
}

// ===== COLLEAGUE REQUEST OPERATIONS =====

export async function createColleagueRequest(requestData: Omit<ColleagueRequest, 'id' | 'submittedAt' | 'followUpCount'>): Promise<ColleagueRequest> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const request: ColleagueRequest = {
    id: requestId,
    ...requestData,
    followUpCount: 0,
    submittedAt: new Date().toISOString(),
  };

  await redis.set(`request:${requestId}`, request);
  await redis.sadd(`user:${requestData.userId}:requests`, requestId);

  return request;
}

export async function getColleagueRequest(requestId: string): Promise<ColleagueRequest | null> {
  const data = await redis.get<ColleagueRequest>(`request:${requestId}`);
  return data;
}

export async function getUserColleagueRequests(userId: string): Promise<ColleagueRequest[]> {
  const requestIds = await redis.smembers(`user:${userId}:requests`);
  if (!requestIds.length) return [];

  const requests = await Promise.all(
    requestIds.map(id => getColleagueRequest(id as string))
  );

  return requests.filter(r => r !== null) as ColleagueRequest[];
}

// ===== WEEKLY REVIEW OPERATIONS =====

export async function createWeeklyReview(reviewData: Omit<WeeklyReview, 'id' | 'createdAt'>): Promise<WeeklyReview> {
  const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const review: WeeklyReview = {
    id: reviewId,
    ...reviewData,
    createdAt: new Date().toISOString(),
  };

  await redis.set(`review:${reviewId}`, review);
  await redis.zadd(`user:${reviewData.userId}:reviews`, {
    score: new Date(review.weekStart).getTime(),
    member: reviewId,
  });

  return review;
}

export async function getWeeklyReview(reviewId: string): Promise<WeeklyReview | null> {
  const data = await redis.get<WeeklyReview>(`review:${reviewId}`);
  return data;
}

export async function getUserWeeklyReviews(userId: string, limit: number = 52): Promise<WeeklyReview[]> {
  const reviewIds = await redis.zrange(`user:${userId}:reviews`, 0, limit - 1, { rev: true });
  if (!reviewIds.length) return [];

  const reviews = await Promise.all(
    reviewIds.map(id => getWeeklyReview(id as string))
  );

  return reviews.filter(r => r !== null) as WeeklyReview[];
}

// ===== UTILITY FUNCTIONS =====

export async function getActiveProjectCount(userId: string): Promise<number> {
  const projects = await getUserProjects(userId);
  return projects.filter(p => p.status !== 'complete' && p.status !== 'paused').length;
}

export async function getProjectTimeLogs(projectId: string, userId: string): Promise<TimeLog[]> {
  const allTimeLogs = await getUserTimeLogs(userId);
  return allTimeLogs.filter(log => log.projectId === projectId);
}

export async function getProjectDebugLogs(projectId: string, userId: string): Promise<DebugLog[]> {
  const allDebugLogs = await getUserDebugLogs(userId);
  return allDebugLogs.filter(log => log.projectId === projectId);
}

export async function completeProject(projectId: string): Promise<Project | null> {
  return await updateProject(projectId, {
    status: 'complete',
    completedAt: new Date().toISOString(),
    progress: 100,
  });
}

export async function pauseProject(projectId: string): Promise<Project | null> {
  return await updateProject(projectId, {
    status: 'paused',
  });
}
