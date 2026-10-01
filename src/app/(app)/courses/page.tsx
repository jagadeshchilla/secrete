"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TOOL_CATALOG } from "@/lib/toolCatalog";
import { stripEmoji } from "@/context/AppStateContext";
import type { Course } from "@/types/course";
import { COURSES } from "@/data/courses";
import { loadCourseProgress, saveCourseProgressLocal, fetchCourseProgress, courseTotals } from "@/lib/courseProgress";
import { useAccess } from "@/context/AccessContext";
import { SUBSTEPS, wholeTopicPrompt, type ResourceLink } from "@/lib/topicSubsteps";
import {
  GraduationCapIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlayIcon,
  LinkIcon,
  BookIcon,
  CopyIcon,
  CheckIcon,
} from "@/components/icons";

const RESOURCE_ICONS: Record<ResourceLink["type"], typeof PlayIcon> = {
  youtube: PlayIcon,
  article: LinkIcon,
  docs: BookIcon,
};

const CATALOG = TOOL_CATALOG;

function CourseCard({ course, pct }: { course: Course; pct?: number }) {
  const { total } = courseTotals(course, {});
  const topicCount = course.sections.reduce((sum, sec) => sum + (sec.customItems?.length || 0), 0);
  const roleCount = course.roleKeys?.length ?? 0;
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]"
    >
      <div className="p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--good)] text-white shadow-sm">
          <GraduationCapIcon className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-base font-semibold leading-snug">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">{course.subtitle}</p>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-[var(--muted)]">
          <span className="border border-[var(--border)] px-2 py-0.5">{course.sections.length} sections</span>
          <span className="border border-[var(--border)] px-2 py-0.5">{topicCount} topics</span>
          <span className="border border-[var(--border)] px-2 py-0.5">{total} sub-tasks</span>
          <span className="border border-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 text-[var(--accent)]">
            {roleCount} {roleCount === 1 ? "role" : "roles"}
          </span>
        </div>

        {pct !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--good)] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] font-semibold text-[var(--accent)]">
              {pct === 100 ? "Completed" : `${pct}% complete`}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-2.5 text-xs font-medium text-[var(--accent)]">
        {pct !== undefined && pct > 0 ? "Continue" : "View course"}
        <ChevronRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function ToolRow({
  tool,
  roles,
  learned,
  onToggleLearned,
  subState,
  onToggleSub,
}: {
  tool: string;
  roles: { domain: string; role: string }[];
  learned: boolean;
  onToggleLearned: () => void;
  subState: Record<string, boolean>;
  onToggleSub: (subKey: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const doneCount = SUBSTEPS.filter((s) => subState[s.key]).length;

  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex w-full items-center gap-3 bg-[var(--surface)] px-4 py-3 hover:bg-[var(--surface-2)]">
        <input
          type="checkbox"
          checked={learned}
          onChange={onToggleLearned}
          className="h-[18px] w-[18px] shrink-0 accent-[var(--good)]"
        />
        <button onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className={`min-w-0 truncate text-sm font-medium ${learned ? "text-[var(--muted)] line-through" : ""}`}>
            {tool}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
              {roles.length} {roles.length === 1 ? "role" : "roles"}
            </span>
            <span
              className={`border px-1.5 py-0.5 text-[10px] font-medium ${
                doneCount === SUBSTEPS.length
                  ? "border-[var(--good)] text-[var(--good)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {doneCount}/{SUBSTEPS.length}
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="animate-fade-in-up space-y-3 bg-[var(--surface-2)] p-4">
          <button
            onClick={() => copy("whole", wholeTopicPrompt(tool))}
            className="flex w-full items-center justify-between gap-2 border border-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1.5 text-left text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
          >
            <span>Ask ChatGPT about all of {tool}</span>
            {copiedKey === "whole" ? <CheckIcon className="h-3.5 w-3.5 shrink-0" /> : <CopyIcon className="h-3.5 w-3.5 shrink-0" />}
          </button>

          <div className="space-y-2">
            {SUBSTEPS.map((s, i) => {
              const checked = !!subState[s.key];
              return (
                <div key={s.key} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleSub(s.key)}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        checked ? "border-[var(--good)] bg-[var(--good)] text-white" : "border-[var(--border)]"
                      }`}
                    >
                      {checked && <CheckIcon className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[var(--muted)]">{i + 1}</span>
                        <span className={`text-xs font-medium ${checked ? "text-[var(--muted)] line-through" : ""}`}>
                          {s.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">{s.reason(tool)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 pl-9">
                    {s.resources.map((r) => {
                      const Icon = RESOURCE_ICONS[r.type];
                      return (
                        <a
                          key={r.type}
                          href={r.url(tool)}
                          target="_blank"
                          rel="noreferrer"
                          title={r.label}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </a>
                      );
                    })}
                    <button
                      onClick={() => copy(s.key, s.prompt(tool))}
                      title="Copy ChatGPT prompt"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {copiedKey === s.key ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Used by {roles.length} {roles.length === 1 ? "role" : "roles"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {roles.map(({ domain, role }) => (
                <Link
                  key={domain + role}
                  href={`/roadmap?domain=${encodeURIComponent(domain)}&role=${encodeURIComponent(role)}`}
                  className="border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[11px] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {role}
                  <span className="ml-1 text-[var(--muted)]">· {stripEmoji(domain)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursesPageInner() {
  const { profile } = useAccess();
  const searchParams = useSearchParams();
  const toolParam = searchParams.get("tool");
  const [search, setSearch] = useState(toolParam || "");
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [toolSubsteps, setToolSubsteps] = useState<Record<string, boolean>>({});
  const [courseProgress, setCourseProgress] = useState<Record<string, { done: number; total: number }>>({});
  const [adminCourses, setAdminCourses] = useState<Course[]>([]);

  const allCourses = useMemo(() => {
    const map = new Map<string, Course>();
    [...COURSES, ...adminCourses].forEach((c) => map.set(c.slug, c));
    return [...map.values()];
  }, [adminCourses]);

  useEffect(() => {
    fetch("/api/admin-courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.courses) setAdminCourses(json.courses);
      })
      .catch(() => {
        // offline or DB not configured yet — just show the static courses
      });
  }, []);

  useEffect(() => {
    if (!profile) return;
    // Local cache paints instantly; each course's DB progress (fetched right
    // after) is the source of truth and overwrites it once it responds —
    // otherwise progress made on another device wouldn't show up here until
    // that specific course page was opened.
    const progress: Record<string, { done: number; total: number }> = {};
    allCourses.forEach((course) => {
      const state = loadCourseProgress(course.slug, profile);
      progress[course.slug] = courseTotals(course, state);
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCourseProgress(progress);

    allCourses.forEach((course) => {
      fetchCourseProgress(course.slug, profile).then((remote) => {
        if (!remote) return;
        saveCourseProgressLocal(course.slug, profile, remote);
        setCourseProgress((prev) => ({ ...prev, [course.slug]: courseTotals(course, remote) }));
      });
    });
  }, [allCourses, profile]);

  const hasQuery = search.trim().length > 0;
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return CATALOG.filter((t) => t.tool.toLowerCase().includes(q));
  }, [search]);

  const startedCourses = useMemo(
    () => allCourses.filter((c) => (courseProgress[c.slug]?.done || 0) > 0),
    [allCourses, courseProgress]
  );

  function toggleLearned(tool: string) {
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool);
      else next.add(tool);
      return next;
    });
  }

  function toggleToolSub(tool: string, subKey: string) {
    setToolSubsteps((prev) => ({ ...prev, [`${tool}::${subKey}`]: !prev[`${tool}::${subKey}`] }));
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <GraduationCapIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Full multi-topic courses with their own checklists, plus a quick-reference list of every tool
        pulled from the Roadmap data.
      </p>

      <div className="animate-fade-in-up relative mt-5">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${CATALOG.length} tools, languages, platforms...`}
          name="courses-tool-search-field"
          autoComplete="off"
          spellCheck={false}
          className="w-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--accent)]"
        />
      </div>

      {hasQuery ? (
        <div className="animate-fade-in-up mt-4">

          {filtered.length === 0 ? (
            <div className="mt-3 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
              No tools match this search/filter.
            </div>
          ) : (
            <div className="mt-3 divide-y divide-[var(--border)] border border-[var(--border)]">
              {filtered.map((t) => {
                const subState: Record<string, boolean> = {};
                SUBSTEPS.forEach((s) => {
                  subState[s.key] = !!toolSubsteps[`${t.tool}::${s.key}`];
                });
                return (
                  <ToolRow
                    key={t.tool}
                    tool={t.tool}
                    roles={t.roles}
                    learned={learned.has(t.tool)}
                    onToggleLearned={() => toggleLearned(t.tool)}
                    subState={subState}
                    onToggleSub={(subKey) => toggleToolSub(t.tool, subKey)}
                  />
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {startedCourses.length > 0 && (
            <div className="animate-fade-in-up mt-6">
              <h2 className="text-sm font-semibold text-[var(--muted)]">Continue learning</h2>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {startedCourses.map((course) => {
                  const p = courseProgress[course.slug];
                  const pct = p && p.total ? Math.round((p.done / p.total) * 100) : 0;
                  return <CourseCard key={course.slug} course={course} pct={pct} />;
                })}
              </div>
            </div>
          )}

          <div className="animate-fade-in-up mt-6">
            <h2 className="text-sm font-semibold text-[var(--muted)]">Available courses</h2>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {allCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <CoursesPageInner />
    </Suspense>
  );
}
