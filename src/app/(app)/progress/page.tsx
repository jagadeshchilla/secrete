"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { useIdeas } from "@/context/IdeasContext";
import { useResearch } from "@/context/ResearchContext";
import { useFreelance } from "@/context/FreelanceContext";
import { PROFILES, PROFILE_LABELS, type Profile } from "@/config/access";
import { RESEARCH_STATUSES } from "@/types/research";
import { FREELANCE_STATUSES } from "@/types/freelance";
import { courseTotals, loadCourseProgress, fetchCourseProgress } from "@/lib/courseProgress";
import { buildActivityMap } from "@/lib/activityHeatmap";
import { computeStreak } from "@/context/AppStateContext";
import type { Course } from "@/types/course";
import StatCard from "@/components/StatCard";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import { GraduationCapIcon, LightbulbIcon, FlaskIcon, BriefcaseIcon, FlameIcon } from "@/components/icons";

type View = "household" | Profile;
type Section = "courses" | "ideas" | "research" | "freelancing";

const SECTIONS: { value: Section; label: string; icon: typeof GraduationCapIcon }[] = [
  { value: "courses", label: "Courses", icon: GraduationCapIcon },
  { value: "ideas", label: "Ideas", icon: LightbulbIcon },
  { value: "research", label: "Research", icon: FlaskIcon },
  { value: "freelancing", label: "Freelancing", icon: BriefcaseIcon },
];

function courseStatsForProfile(courses: Course[], progress: Record<string, { done: number; total: number }>) {
  let started = 0;
  let completed = 0;
  let totalDone = 0;
  let totalAll = 0;
  courses.forEach((c) => {
    const p = progress[c.slug];
    const done = p?.done || 0;
    const total = p?.total ?? courseTotals(c, {}).total;
    totalDone += done;
    totalAll += total;
    if (done > 0) started++;
    if (total > 0 && done === total) completed++;
  });
  return {
    totalCourses: courses.length,
    started,
    completed,
    pct: totalAll ? Math.round((totalDone / totalAll) * 100) : 0,
  };
}

export default function ProgressPage() {
  const { profile } = useAccess();
  const { ideas } = useIdeas();
  const { papers } = useResearch();
  const { gigs } = useFreelance();
  const [view, setView] = useState<View>(profile || "household");
  const [section, setSection] = useState<Section>("courses");

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

  const ideaStatsForProfile = (p: Profile) => {
    const mine = ideas.filter((i) => i.createdBy === p);
    const doneTasks = mine.reduce((sum, i) => sum + i.tasks.filter((t) => t.done).length, 0);
    const totalTasks = mine.reduce((sum, i) => sum + i.tasks.length, 0);
    return {
      total: mine.length,
      pending: mine.filter((i) => i.feasible === null).length,
      notPursuing: mine.filter((i) => i.feasible === false).length,
      done: mine.filter((i) => i.done).length,
      doneTasks,
      totalTasks,
    };
  };

  const researchStatsForProfile = (p: Profile) => {
    const mine = papers.filter((r) => r.createdBy === p);
    return {
      total: mine.length,
      byStatus: RESEARCH_STATUSES.map((s) => ({
        ...s,
        count: mine.filter((r) => r.status === s.value).length,
      })),
    };
  };

  const freelanceStatsForProfile = (p: Profile) => {
    const mine = gigs.filter((g) => g.createdBy === p);
    return {
      total: mine.length,
      byStatus: FREELANCE_STATUSES.map((s) => ({
        ...s,
        count: mine.filter((g) => g.status === s.value).length,
      })),
    };
  };

  const activityMap = useMemo(
    () => buildActivityMap({ ideas, papers, gigs, courses }, view === "household" ? null : view),
    [ideas, papers, gigs, courses, view]
  );
  const activityStreak = useMemo(() => computeStreak(activityMap), [activityMap]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Your activity across courses, ideas, research, and freelancing.
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

      <div className="surface-card mt-4 max-w-xl animate-fade-in-up p-5">
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

      <div className="animate-fade-in-up mt-4 flex flex-wrap gap-1.5">
        {SECTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setSection(value)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              section === value
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {section === "courses" &&
        (view === "household" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {PROFILES.map((p, i) => {
              const s = courseStatsForProfile(courses, courseProgressByProfile[p]);
              return (
                <div
                  key={p}
                  className="surface-card animate-fade-in-up p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <h2 className="text-base font-semibold">
                    {PROFILE_LABELS[p]}
                    {p === profile ? " (me)" : ""}
                  </h2>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <StatCard label="Started" value={s.started} />
                    <StatCard label="Completed" value={s.completed} />
                    <StatCard label="Total" value={s.totalCourses} />
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-[var(--border)]">
                    <div className="h-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${s.pct}%` }} />
                  </div>
                  <div className="mt-1.5 text-[11px] text-[var(--muted)]">{s.pct}% across all course content</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(() => {
              const s = courseStatsForProfile(courses, courseProgressByProfile[view]);
              return (
                <>
                  <StatCard label="Courses started" value={s.started} />
                  <StatCard label="Courses completed" value={s.completed} />
                  <StatCard label="Total courses" value={s.totalCourses} />
                  <StatCard label="Overall progress" value={`${s.pct}%`} />
                </>
              );
            })()}
          </div>
        ))}

      {section === "ideas" &&
        (view === "household" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {PROFILES.map((p, i) => {
              const s = ideaStatsForProfile(p);
              return (
                <div
                  key={p}
                  className="surface-card animate-fade-in-up p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <h2 className="text-base font-semibold">
                    {PROFILE_LABELS[p]}
                    {p === profile ? " (me)" : ""}
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <StatCard label="Ideas added" value={s.total} />
                    <StatCard label="Done" value={s.done} />
                    <StatCard label="Awaiting decision" value={s.pending} />
                    <StatCard label="Not pursuing" value={s.notPursuing} />
                  </div>
                  <div className="mt-3 text-[11px] text-[var(--muted)]">
                    Tasks: {s.doneTasks}/{s.totalTasks} done
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(() => {
              const s = ideaStatsForProfile(view);
              return (
                <>
                  <StatCard label="Ideas added" value={s.total} />
                  <StatCard label="Done" value={s.done} />
                  <StatCard label="Awaiting decision" value={s.pending} />
                  <StatCard label="Tasks done" value={`${s.doneTasks}/${s.totalTasks}`} />
                </>
              );
            })()}
          </div>
        ))}

      {section === "research" &&
        (view === "household" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {PROFILES.map((p, i) => {
              const s = researchStatsForProfile(p);
              return (
                <div
                  key={p}
                  className="surface-card animate-fade-in-up p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <h2 className="text-base font-semibold">
                    {PROFILE_LABELS[p]}
                    {p === profile ? " (me)" : ""}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">{s.total} papers added</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {s.byStatus.map((st) => (
                      <StatCard key={st.value} label={st.label} value={st.count} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {researchStatsForProfile(view).byStatus.map((st) => (
              <StatCard key={st.value} label={st.label} value={st.count} />
            ))}
          </div>
        ))}

      {section === "freelancing" &&
        (view === "household" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {PROFILES.map((p, i) => {
              const s = freelanceStatsForProfile(p);
              return (
                <div
                  key={p}
                  className="surface-card animate-fade-in-up p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <h2 className="text-base font-semibold">
                    {PROFILE_LABELS[p]}
                    {p === profile ? " (me)" : ""}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">{s.total} gigs added</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {s.byStatus.map((st) => (
                      <StatCard key={st.value} label={st.label} value={st.count} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {freelanceStatsForProfile(view).byStatus.map((st) => (
              <StatCard key={st.value} label={st.label} value={st.count} />
            ))}
          </div>
        ))}
    </div>
  );
}
