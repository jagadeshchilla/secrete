import type { Profile } from "@/config/access";

export type FreelanceStatus = "open" | "applied" | "in-progress" | "completed";

export const FREELANCE_STATUSES: { value: FreelanceStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "applied", label: "Applied" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export interface FreelanceGig {
  id: string;
  title: string;
  description: string;
  status: FreelanceStatus;
  link?: string; // listing URL
  budget?: string; // free-text rate/budget, e.g. "$40/hr" or "$1,200 fixed"
  domains: string[];
  roleKeys: string[]; // `${domain}||${role}`, same key shape as ProgressState
  createdBy: Profile;
  createdAt: string;
}
