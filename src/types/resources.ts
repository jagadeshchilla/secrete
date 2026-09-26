export type ResourceType = "youtube" | "article" | "course" | "docs" | "other";

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  addedAt: string;
}

// keyed by `${domain}||${role}`, same key shape as ProgressState
export type ResourceState = Record<string, LearningResource[]>;
