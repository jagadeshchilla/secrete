"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppState, buildProgressEvents, computeStreak } from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import { useIdeas } from "@/context/IdeasContext";
import { useResearch } from "@/context/ResearchContext";
import { useFreelance } from "@/context/FreelanceContext";
import { PROFILES, PROFILE_LABELS, type Profile } from "@/config/access";
import type { StatusField } from "@/types/career";
import type { Course } from "@/types/course";
import { ROADMAP_DATA } from "@/data/roadmapData";
import { courseTotals, loadCourseProgress, fetchCourseProgress } from "@/lib/courseProgress";
import { buildActivityMap } from "@/lib/activityHeatmap";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import {
  RouteIcon,
  GraduationCapIcon,
  CalendarIcon,
  LightbulbIcon,
  FlaskIcon,
  BriefcaseIcon,
  FlameIcon,
} from "@/components/icons";

const ROADMAP_ROLE_COUNT = Object.keys(ROADMAP_DATA).length;
const TOOL_COUNT = new Set(
  Object.values(ROADMAP_DATA).flatMap((entry) => entry.skills.flatMap((s) => s.items))
).size;

type View = "household" | Profile;

function MiniStat({
  icon: Icon,
  label,
  value,
  sub,
  pct,
  delay,
}: {
  icon: typeof RouteIcon;
  label: string;
  value: string | number;
  sub: string;
  pct?: number;
  delay?: number;
}) {
  return (
    <div
      className="surface-card animate-fade-in-up p-4"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{label}</div>
        </div>
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-[var(--muted)]">{sub}</div>
      {pct !== undefined && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--good)] transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function actionVerb(field: StatusField) {
  switch (field) {
    case "researched":
      return "researched";
    case "interested":
      return "showed interest in";
    case "completed":
      return "completed";
    case "saved":
      return "saved";
  }
}

type HouseholdEvent =
  | { kind: "progress"; date: string; by: Profile; field: StatusField; role: string }
  | { kind: "idea"; date: string; by: Profile; title: string }
  | { kind: "course"; date: string; slug: string; title: string };

export default function Dashboard() {
  const { data, progress } = useAppState();
  const { profile } = useAccess();
  const { ideas } = useIdeas();
  const { papers } = useResearch();
  const { gigs } = useFreelance();
  const [view, setView] = useState<View>(profile || "household");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseProgressByProfile, setCourseProgressByProfile] = useState<
    Record<Profile, Record<string, { done: number; total: number }>>
  >({ jagadesh: {}, harshita: {} });

  useEffect(() => {
    fetch("/api/admin-courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.courses) setCourses(json.courses);
      })
      .catch(() => {
        // offline or DB not configured yet
      });
  }, []);

  useEffect(() => {
    if (!courses.length) return;
    PROFILES.forEach((p) => {
      courses.forEach((c) => {
        const local = courseTotals(c, loadCourseProgress(c.slug, p));
        setCourseProgressByProfile((prev) => ({ ...prev, [p]: { ...prev[p], [c.slug]: local } }));
        fetchCourseProgress(c.slug, p).then((remote) => {
          if (!remote) return;
          const remoteTotals = courseTotals(c, remote);
          setCourseProgressByProfile((prev) => ({ ...prev, [p]: { ...prev[p], [c.slug]: remoteTotals } }));
        });
      });
    });
  }, [courses]);

  const courseStats = useMemo(() => {
    const profilesToCount = view === "household" ? PROFILES : [view];
    let started = 0;
    let completed = 0;
    let totalDone = 0;
    let totalAll = 0;
    profilesToCount.forEach((p) => {
      courses.forEach((c) => {
        const prog = courseProgressByProfile[p]?.[c.slug];
        const done = prog?.done || 0;
        const total = prog?.total ?? courseTotals(c, {}).total;
        totalDone += done;
        totalAll += total;
        if (done > 0) started++;
        if (total > 0 && done === total) completed++;
      });
    });
    return {
      total: courses.length * profilesToCount.length,
      started,
      completed,
      pct: totalAll ? Math.round((totalDone / totalAll) * 100) : 0,
    };
  }, [courses, courseProgressByProfile, view]);

  const ideaStats = useMemo(() => {
    const mine = view === "household" ? ideas : ideas.filter((i) => i.createdBy === view);
    return {
      total: mine.length,
      done: mine.filter((i) => i.done).length,
      pending: mine.filter((i) => i.feasible === null).length,
    };
  }, [ideas, view]);

  const researchStats = useMemo(() => {
    const mine = view === "household" ? papers : papers.filter((p) => p.createdBy === view);
    return { total: mine.length, published: mine.filter((p) => p.status === "published").length };
  }, [papers, view]);

  const freelanceStats = useMemo(() => {
    const mine = view === "household" ? gigs : gigs.filter((g) => g.createdBy === view);
    return { total: mine.length, completed: mine.filter((g) => g.status === "completed").length };
  }, [gigs, view]);

  const activityMap = useMemo(
    () => buildActivityMap({ ideas, papers, gigs, courses }, view === "household" ? null : view),
    [ideas, papers, gigs, courses, view]
  );
  const activityStreak = useMemo(() => computeStreak(activityMap), [activityMap]);

  const courseEvents = useMemo<HouseholdEvent[]>(
    () =>
      courses
        .filter((c) => c.createdAt)
        .map((c) => ({ kind: "course", date: c.createdAt!, slug: c.slug, title: c.title })),
    [courses]
  );

  const timeline = useMemo<HouseholdEvent[]>(() => {
    const progressEvents: HouseholdEvent[] = buildProgressEvents(
      data,
      progress,
      view === "household" ? null : view,
      15
    ).map((e) => ({
      kind: "progress",
      date: e.date,
      by: e.by,
      field: e.field,
      role: e.role,
    }));
    const ideaEvents: HouseholdEvent[] = ideas
      .filter((idea) => view === "household" || idea.createdBy === view)
      .map((idea) => ({ kind: "idea", date: idea.createdAt, by: idea.createdBy, title: idea.title }));
    return [...progressEvents, ...ideaEvents, ...courseEvents]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 15);
  }, [data, progress, ideas, view, courseEvents]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Your career research at a glance. Pick up where you left off.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-[var(--border)]">
          <button
            onClick={() => setView("household")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "household" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            Household
          </button>
          {PROFILES.map((p) => (
            <button
              key={p}
              onClick={() => setView(p)}
              className={`border-l border-[var(--border)] px-3 py-1.5 text-xs font-medium transition-colors ${
                view === p ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {PROFILE_LABELS[p]}
              {p === profile ? " (me)" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href="/roadmap"
          className="card-hover group animate-fade-in-up flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] transition-transform group-hover:scale-105">
            <RouteIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Roadmap</div>
            <div className="text-xs text-[var(--muted)]">{ROADMAP_ROLE_COUNT} role paths mapped</div>
          </div>
        </Link>
        <Link
          href="/courses"
          className="card-hover group animate-fade-in-up flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          style={{ animationDelay: "40ms" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] transition-transform group-hover:scale-105">
            <GraduationCapIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Courses</div>
            <div className="text-xs text-[var(--muted)]">{TOOL_COUNT} tools to learn</div>
          </div>
        </Link>
        <Link
          href="/progress"
          className="card-hover group animate-fade-in-up flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] transition-transform group-hover:scale-105">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Progress</div>
            <div className="text-xs text-[var(--muted)]">Roles, courses, ideas &amp; more</div>
          </div>
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat
          icon={GraduationCapIcon}
          label="Courses"
          value={`${courseStats.started}/${courseStats.total}`}
          sub={`${courseStats.pct}% complete`}
          pct={courseStats.pct}
        />
        <MiniStat
          icon={LightbulbIcon}
          label="Ideas"
          value={ideaStats.total}
          sub={`${ideaStats.done} done · ${ideaStats.pending} pending`}
          pct={ideaStats.total ? Math.round((ideaStats.done / ideaStats.total) * 100) : 0}
          delay={40}
        />
        <MiniStat
          icon={FlaskIcon}
          label="Research"
          value={researchStats.total}
          sub={`${researchStats.published} published`}
          pct={researchStats.total ? Math.round((researchStats.published / researchStats.total) * 100) : 0}
          delay={80}
        />
        <MiniStat
          icon={BriefcaseIcon}
          label="Freelancing"
          value={freelanceStats.total}
          sub={`${freelanceStats.completed} completed`}
          pct={freelanceStats.total ? Math.round((freelanceStats.completed / freelanceStats.total) * 100) : 0}
          delay={120}
        />
      </div>

      <div className="surface-card mt-4 max-w-xl animate-fade-in-up p-5" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center gap-2">
          <FlameIcon className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold">Activity streak</h2>
        </div>
        <div className="mt-3 flex gap-5">
          <div>
            <div className="text-2xl font-semibold tabular-nums">{activityStreak.current}</div>
            <div className="text-[11px] text-[var(--muted)]">Day streak</div>
          </div>
          <div>
            <div className="text-2xl font-semibold tabular-nums">{activityStreak.longest}</div>
            <div className="text-[11px] text-[var(--muted)]">Longest</div>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <HeatmapCalendar activityByDate={activityMap} mode="rolling" weeks={10} />
        </div>
      </div>

      <div className="surface-card mt-4 animate-fade-in-up p-5" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <Link href="/progress" className="text-xs font-medium text-[var(--accent)] hover:underline">
            View full progress →
          </Link>
        </div>
        {timeline.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Mark roles as researched, interested or completed to start building activity here.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)]">
            {timeline.map((e, i) => (
              <li key={`${e.kind}-${e.date}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
                <span className="flex min-w-0 items-center gap-1.5 truncate">
                  {e.kind === "idea" && <LightbulbIcon className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />}
                  {e.kind === "course" && <GraduationCapIcon className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />}
                  <span className="min-w-0 truncate">
                    {e.kind === "course" ? (
                      <>
                        Admin added the course <strong className="font-medium">{e.title}</strong>
                      </>
                    ) : (
                      <>
                        <strong className="font-medium">{PROFILE_LABELS[e.by]}</strong>{" "}
                        {e.kind === "idea" ? (
                          <>
                            added the idea <strong className="font-medium">{e.title}</strong>
                          </>
                        ) : (
                          <>
                            {actionVerb(e.field)} <strong className="font-medium">{e.role}</strong>
                          </>
                        )}
                      </>
                    )}
                  </span>
                </span>
                <span className="shrink-0 pl-2 text-xs text-[var(--muted)]">
                  {new Date(e.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
