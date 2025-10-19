// Project Types

// Base project interface - minimal required fields for all projects
export interface ProjectBase {
  id: string;
  userId: string;
  name: string;
  status: 'planning' | 'building' | 'debugging' | 'testing' | 'complete' | 'paused';
  priority: 'low' | 'medium' | 'high';
  buildingHours: number;
  debuggingHours: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Full project interface - used by the 3-step wizard
export interface WizardProject extends ProjectBase {
  // Required wizard fields
  problemStatement: string;
  targetUser: string;
  mvpScope: string[];
  outOfScope: string;
  platform: 'n8n' | 'claude-code' | 'lovable' | 'other';
  estimatedHours: number;

  // Optional wizard fields
  potentialRisks?: string;
  mitigationStrategy?: string;
  description?: string;
  stuckSince?: string;
  nextAction?: string;
}

// Main Project type - union of all project types
// This allows flexibility while maintaining type safety
export interface Project extends ProjectBase {
  description?: string;
  problemStatement?: string;
  targetUser?: string;
  mvpScope?: string[];
  outOfScope?: string;
  platform?: 'n8n' | 'claude-code' | 'lovable' | 'other';
  estimatedHours?: number;
  potentialRisks?: string;
  mitigationStrategy?: string;
  stuckSince?: string;
  nextAction?: string;
}

// Type guard to check if a project is a complete wizard project
export function isWizardProject(project: Project): project is WizardProject {
  return !!(
    project.problemStatement &&
    project.targetUser &&
    project.mvpScope &&
    project.outOfScope &&
    project.platform &&
    typeof project.estimatedHours === 'number'
  );
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
