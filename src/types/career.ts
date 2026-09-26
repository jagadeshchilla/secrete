import type { Profile } from "@/config/access";

export interface CareerRole {
  domain: string;
  role: string;
  description: string;
  coding: string;
  ai: string;
  outlook: string;
  type: string;
}

export type StatusField = "researched" | "interested" | "completed" | "saved";

export interface ProgressRecord {
  researched?: boolean;
  researchedAt?: string;
  interested?: boolean;
  interestedAt?: string;
  completed?: boolean;
  completedAt?: string;
  saved?: boolean;
  savedAt?: string;
  notes?: string;
}

// Each role tracks Jagadesh's and Harshita's own status independently.
export type RoleProgress = Partial<Record<Profile, ProgressRecord>>;
export type ProgressState = Record<string, RoleProgress>;
