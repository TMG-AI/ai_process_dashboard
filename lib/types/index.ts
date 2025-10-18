// Project Types
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  problemStatement?: string;
  targetUser?: string;
  mvpScope?: string[];
  outOfScope?: string;
  status: 'planning' | 'building' | 'debugging' | 'testing' | 'complete' | 'paused';
  platform?: 'n8n' | 'claude-code' | 'lovable' | 'other';
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  buildingHours: number;
  debuggingHours: number;
  progress: number;
  potentialRisks?: string;
  mitigationStrategy?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  stuckSince?: string;
  nextAction?: string;
}

export interface TimeLog {
  id: string;
  projectId: string;
  userId: string;
  timerType: 'building' | 'debugging';
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
}

export interface DebugLog {
  id: string;
  projectId: string;
  userId: string;
  errorDescription?: string;
  attempts: Array<{ attempt: string; timestamp: string }>;
  hypothesis?: string;
  solution?: string;
  timeSpentMinutes?: number;
  createdAt: string;
}

export interface ColleagueRequest {
  id: string;
  userId: string;
  requesterName: string;
  requesterEmail: string;
  problemStatement?: string;
  currentWorkflow?: string;
  desiredOutcome?: string;
  status: 'submitted' | 'in-progress' | 'complete' | 'dropped';
  projectId?: string;
  submittedAt: string;
  lastContactAt?: string;
  followUpCount: number;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStart: string;
  projectsReviewed: Array<{ projectId: string; madeProgress: boolean }>;
  buildingHours: number;
  debuggingHours: number;
  completedCount: number;
  insights?: string;
  nextWeekGoal?: string;
  createdAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
}

// Mode Types
export type Mode = 'building' | 'debugging';
