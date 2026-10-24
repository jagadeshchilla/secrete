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

export interface IdeaDataSource {
  id: string;
  label: string;
  url: string;
  extract?: string; // what can be extracted from this source
  category?: string; // free-text, e.g. "Dataset", "API", "Scraping"
}

// Used for both researchTopics and methods — a short text item that can carry
// its own saved ChatGPT prompt override (auto-generated default used when absent).
export interface IdeaPromptItem {
  id: string;
  text: string;
  prompt?: string;
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
  chatgptProjectLink?: string; // shared ChatGPT Project link both profiles chat in
  githubUrl?: string;
  researchTopics: IdeaPromptItem[];
  dataSources: IdeaDataSource[];
  methods: IdeaPromptItem[];
  techStack: string[];
  tasks: IdeaTask[];
  targetDate?: string;
  blockers?: string;
  outcomeNotes?: string;
  researchPaperLink?: string;
  done: boolean;
}
