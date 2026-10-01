import type { Course } from "@/types/course";
import type { Profile } from "@/config/access";

function storageKey(slug: string, profile: Profile) {
  return `courseProgress::${slug}::${profile}`;
}

export function loadCourseProgress(slug: string, profile: Profile): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(storageKey(slug, profile));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCourseProgressLocal(slug: string, profile: Profile, state: Record<string, boolean>) {
  try {
    localStorage.setItem(storageKey(slug, profile), JSON.stringify(state));
  } catch {
    // ignore write failures
  }
}

export async function fetchCourseProgress(slug: string, profile: Profile): Promise<Record<string, boolean> | null> {
  try {
    const res = await fetch(`/api/course-progress?slug=${encodeURIComponent(slug)}&profile=${profile}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.progress ?? null;
  } catch {
    return null;
  }
}

export function syncCourseProgress(slug: string, profile: Profile, key: string, done: boolean) {
  fetch("/api/course-progress", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, profile, key, done }),
    keepalive: true,
  }).catch(() => {
    // offline or DB not configured yet — local cache still has it
  });
}

// Admin-authored items (custom courses) carry their own variable-length
// substep list, keyed by stable DB ids instead of positional indices.
export function customKeyFor(itemId: string, substepId: string) {
  return `custom::${itemId}::${substepId}`;
}

export function customItemDoneCount(state: Record<string, boolean>, itemId: string, substepIds: string[]) {
  return substepIds.filter((id) => state[customKeyFor(itemId, id)]).length;
}

export function courseTotals(course: Course, state: Record<string, boolean>) {
  let total = 0;
  let done = 0;
  course.sections.forEach((sec) => {
    (sec.customItems || []).forEach((item) => {
      total += item.substeps.length;
      done += customItemDoneCount(
        state,
        item.id,
        item.substeps.map((s) => s.id)
      );
    });
  });
  return { total, done };
}
