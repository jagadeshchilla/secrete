export type CourseTrack = "core" | "backend" | "data" | "ai" | "infra";

export type ResourceType = "youtube" | "article" | "docs" | "course" | "other";

// Admin-authored sub-topic learning point — replaces the generic templated
// substep for custom courses created through the Admin panel.
export interface CourseSubstep {
  id: string;
  label: string;
  whatYouLearn: string;
  resourceType: ResourceType;
  resourceUrl: string;
  prompt: string;
}

// Admin-authored sub-topic (e.g. "Linux" under "0. Prerequisites").
export interface CourseItem {
  id: string;
  title: string;
  wholePrompt: string;
  substeps: CourseSubstep[];
}

export interface CourseSection {
  id: string;
  title: string;
  priority: 5 | 4 | 0;
  track: CourseTrack;
  note?: string;
  customItems?: CourseItem[]; // admin-authored rich items
}

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  roleKeys?: string[];
  sections: CourseSection[];
  // true for DB-backed courses created through the Admin panel (editable/deletable there).
  isCustom?: boolean;
  // Who created it and when — "jagadesh" | "harshita", used to surface "new course" activity/notifications.
  createdBy?: string;
  createdAt?: string;
}
