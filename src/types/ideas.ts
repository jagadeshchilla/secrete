import type { Profile } from "@/config/access";

export type IdeaTaskType = "coding" | "researching" | "implementing" | "developing";

export const IDEA_TASK_TYPES: { value: IdeaTaskType; label: string }[] = [
  { value: "researching", label: "Researching" },
  { value: "coding", label: "Coding" },
  { value: "implementing", label: "Implementing" },
  { value: "developing", label: "Developing" },
];

export interface IdeaTask {
  id: string;
  title: string;
  type: IdeaTaskType;
  assignedTo?: Profile;
  done: boolean;
}

export type IdeaDataCategory = "dataset" | "api" | "scraping" | "survey" | "internal" | "other";

export const IDEA_DATA_CATEGORIES: { value: IdeaDataCategory; label: string }[] = [
  { value: "dataset", label: "Dataset" },
  { value: "api", label: "API" },
  { value: "scraping", label: "Scraping" },
  { value: "survey", label: "Survey" },
  { value: "internal", label: "Internal" },
  { value: "other", label: "Other" },
];

export interface IdeaDataSource {
  id: string;
  label: string;
  url: string;
  extract?: string; // what can be extracted from this source
  category?: IdeaDataCategory;
}

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  domains: string[]; // full domain strings, e.g. "🤖 AI / Machine Learning"
  roleKeys: string[]; // `${domain}||${role}`, same key shape as ProgressState
  createdBy: Profile;
  createdAt: string;

  // Feasibility gate — decided while viewing the idea, not at creation.
  // null = not decided yet; false stops at the reason, with none of the
  // workflow fields below shown in the UI.
  feasible: boolean | null;
  infeasibleReason?: string;

  // Only meaningful once feasible is true.
  researchTopics: string[];
  dataSources: IdeaDataSource[];
  methods: string[];
  techStack: string[];
  tasks: IdeaTask[];
  targetDate?: string;
  blockers?: string;
  outcomeNotes?: string;
  researchPaperLink?: string;
  done: boolean;
}
