// Project Types

// PRD (Product Requirements Document) Interface
export interface ProjectPRD {
  // Overview (using existing project fields: name, description, whoWillUseIt)
  whyBuilding?: string; // Business value / problem it solves

  // Technical Approach
  apisRequired?: string[]; // List of APIs needed (Anthropic, OpenAI, Stripe, etc.)
  dataStorage?: string; // What data needs to be stored and where
  authenticationNeeds?: string; // Auth requirements

  // Learning & Research
  learningNeeds?: string[]; // What needs to be learned first
  researchEffort?: 'low' | 'medium' | 'high'; // Estimated research time
  resources?: string[]; // Links to docs, tutorials, examples

  // Prerequisites & Dependencies
  externalDependencies?: Array<{
    type: 'colleague-input' | 'api-key' | 'service-access' | 'data-source' | 'other';
    description: string;
    who?: string; // For colleague inputs
    neededBy?: string; // Date if applicable
  }>;
  anticipatedBlockers?: string[]; // Potential blockers to watch for

  // Risk Assessment
  knownRisks?: string[]; // What could go wrong
  complexityScore?: number; // 1-10, AI-evaluated
  confidenceLevel?: 'high' | 'medium' | 'low'; // How clear is the path

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  completenessScore?: number; // 0-100, AI-calculated
}

// Base project interface - minimal required fields for all projects
export interface ProjectBase {
  id: string;
  userId: string;
  name: string;
  status: 'planning' | 'building' | 'debugging' | 'testing' | 'complete' | 'paused';
  priority: 'low' | 'medium' | 'high';
  buildingHours: number;
  debuggingHours: number;
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
  whoWillUseIt?: string;
  features?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  targetCompletion?: string;
  platform?: 'n8n' | 'claude-code' | 'lovable' | 'other';

  // PRD (Product Requirements Document)
  prd?: ProjectPRD;

  // Deployment and repository links
  vercelUrl?: string;
  githubUrl?: string;
  n8nWorkflowJson?: string; // JSON string of the n8n workflow

  // Legacy fields (kept for backward compatibility)
  problemStatement?: string;
  targetUser?: string;
  mvpScope?: string[];
  outOfScope?: string;
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

export interface LearningLog {
  id: string;
  userId: string;
  sources: Array<'nate-jones' | 'other-substacks' | 'tiktok-ai' | 'claude-code' | 'other'>; // Multiple sources can be selected
  otherSource?: string; // Custom text if 'other' is selected
  topic?: string; // What they learned about
  description?: string; // Optional notes about what was learned
  startedAt: string;
  endedAt?: string;
  durationMinutes: number; // Can be set manually or calculated
  isManual: boolean; // true if manually entered, false if tracked with timer
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
