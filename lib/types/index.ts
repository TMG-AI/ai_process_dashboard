// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'building' | 'debugging' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
}

// Mode Types
export type Mode = 'building' | 'debugging';
