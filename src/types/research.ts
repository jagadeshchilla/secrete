import type { Profile } from "@/config/access";

export type ResearchStatus = "idea" | "drafting" | "submitted" | "published";

export const RESEARCH_STATUSES: { value: ResearchStatus; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "drafting", label: "Drafting" },
  { value: "submitted", label: "Submitted" },
  { value: "published", label: "Published" },
];

export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  status: ResearchStatus;
  link?: string; // draft doc or published URL
  domains: string[];
  roleKeys: string[]; // `${domain}||${role}`, same key shape as ProgressState
  createdBy: Profile;
  createdAt: string;
}
