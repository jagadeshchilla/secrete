import type { Profile } from "@/config/access";
import type { ProjectIdea } from "@/types/ideas";
import type { ResearchPaper } from "@/types/research";
import type { FreelanceGig } from "@/types/freelance";
import type { Course } from "@/types/course";

// Combined activity-by-date map across Courses, Ideas, Research, and
// Freelancing — replaces the old roles-only heatmap now that progress
// tracking covers all four areas instead of just roles.
export function buildActivityMap(
  { ideas, papers, gigs, courses }: { ideas: ProjectIdea[]; papers: ResearchPaper[]; gigs: FreelanceGig[]; courses: Course[] },
  profile: Profile | null
) {
  const map = new Map<string, number>();
  function add(dateStr: string | undefined) {
    if (!dateStr) return;
    const day = dateStr.slice(0, 10);
    map.set(day, (map.get(day) || 0) + 1);
  }
  ideas.forEach((i) => {
    if (!profile || i.createdBy === profile) add(i.createdAt);
  });
  papers.forEach((p) => {
    if (!profile || p.createdBy === profile) add(p.createdAt);
  });
  gigs.forEach((g) => {
    if (!profile || g.createdBy === profile) add(g.createdAt);
  });
  courses.forEach((c) => {
    if (!profile || !c.createdBy || c.createdBy === profile) add(c.createdAt);
  });
  return map;
}
