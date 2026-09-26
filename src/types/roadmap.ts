export interface SkillCategory {
  category: string;
  items: string[];
  /** when this stage's skills are largely borrowed from another role (e.g. MLOps
   * borrowing from Data Engineering), link to it — keyFor(role) of that role */
  sourceRoleKey?: string;
}

export interface RoadmapEntry {
  /** keyFor(role) of related roles this role commonly progresses to/from or overlaps with */
  relatedRoleKeys: string[];
  skills: SkillCategory[];
  /** where this data was researched from, shown as a small citation in the UI */
  sources: { title: string; url: string }[];
}

// keyed by keyFor(role) = `${domain}||${role}`
export type RoadmapData = Record<string, RoadmapEntry>;
