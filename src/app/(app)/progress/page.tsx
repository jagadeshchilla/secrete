"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAppState,
  statsForProfile,
  activityForProfile,
  streakForProfile,
  buildProgressEvents,
} from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import { useIdeas } from "@/context/IdeasContext";
import { useResearch } from "@/context/ResearchContext";
import { useFreelance } from "@/context/FreelanceContext";
import { PROFILES, PROFILE_LABELS, type Profile } from "@/config/access";
import { RESEARCH_STATUSES } from "@/types/research";
import { FREELANCE_STATUSES } from "@/types/freelance";
import { courseTotals, loadCourseProgress, fetchCourseProgress } from "@/lib/courseProgress";
import type { Course } from "@/types/course";
import StatCard from "@/components/StatCard";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import { FlameIcon, GraduationCapIcon, LightbulbIcon, FlaskIcon, BriefcaseIcon, RouteIcon } from "@/components/icons";

type View = "household" | Profile;
type Section = "roles" | "courses" | "ideas" | "research" | "freelancing";

const SECTIONS: { value: Section; label: string; icon: typeof RouteIcon }[] = [
  { value: "roles", label: "Roles", icon: RouteIcon },
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
  const { data, progress, activityByDate, streak, stats } = useAppState();
  const { profile } = useAccess();
  const { ideas } = useIdeas();
  const { papers } = useResearch();
  const { gigs } = useFreelance();
  const [view, setView] = useState<View>(profile || "household");
  const [section, setSection] = useState<Section>("roles");

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseProgressByProfile, setCourseProgressByProfile] = useState<
    Record<Profile, Record<string, { done: number; total: number }>>
  >({ jagadesh: {}, harshita: {} });

  useEffect(() => {
    if (section !== "courses") return;
    fetch("/api/admin-courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.courses) setCourses(json.courses);
      })
      .catch(() => {
        // offline or DB not configured yet
      });
  }, [section]);

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

  const viewStats = view === "household" ? stats : statsForProfile(data, progress, view);
  const viewActivity = view === "household" ? activityByDate : activityForProfile(progress, view);
  const viewStreak = view === "household" ? streak : streakForProfile(progress, view);

  const perProfile = useMemo(
    () =>
      PROFILES.map((p) => ({
        profile: p,
        stats: statsForProfile(data, progress, p),
        activity: activityForProfile(progress, p),
        streak: streakForProfile(progress, p),
        timeline: buildProgressEvents(data, progress, p, 12),
      })),
    [data, progress]
  );

  const timeline = useMemo(
    () => buildProgressEvents(data, progress, view === "household" ? null : view, 12),
    [data, progress, view]
  );

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

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Your activity across roles, courses, ideas, research, and freelancing.
          </p>
        </div>
        <div className="flex border border-[var(--border)]">
          <button
            onClick={() => setView("household")}
            className={`px-3 py-1.5 text-xs font-medium ${
              view === "household" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"
            }`}
          >
            Household
          </button>
          {PROFILES.map((p) => (
            <button
              key={p}
              onClick={() => setView(p)}
              className={`border-l border-[var(--border)] px-3 py-1.5 text-xs font-medium ${
                view === p ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              {PROFILE_LABELS[p]}
              {p === profile ? " (me)" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-fade-in-up mt-4 flex flex-wrap gap-1.5">
        {SECTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setSection(value)}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors ${
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

      {section === "roles" &&
        (view === "household" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {perProfile.map(({ profile: p, stats: pStats, activity: pActivity, streak: pStreak, timeline: pTimeline }, i) => (
              <div
                key={p}
                className="animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <button
                  onClick={() => setView(p)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h2 className="text-base font-semibold">
                    {PROFILE_LABELS[p]}
                    {p === profile ? " (me)" : ""}
                  </h2>
                  <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                    <FlameIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
                    {pStreak.current} day streak
                  </span>
                </button>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <StatCard label="Researched" value={pStats.researched} />
                  <StatCard label="Interested" value={pStats.interested} />
                  <StatCard label="Completed" value={pStats.completed} />
                </div>

                <div className="mt-4 h-1.5 w-full bg-[var(--border)]">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${pStats.pct}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[11px] text-[var(--muted)]">
                  {pStats.pct}% of {pStats.total} roles · longest streak {pStreak.longest}d
                </div>

                <div className="mt-4 overflow-x-auto">
                  <HeatmapCalendar activityByDate={pActivity} mode="year" />
                </div>

                <div className="mt-4 border-t border-[var(--border)] pt-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    What {PROFILE_LABELS[p]} is doing
                  </h3>
                  {pTimeline.length === 0 ? (
                    <p className="mt-2 text-sm text-[var(--muted)]">No activity yet.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-[var(--border)]">
                      {pTimeline.map((e, j) => (
                        <li key={`${e.date}-${e.role}-${e.field}-${j}`} className="flex items-center justify-between py-2 text-sm">
                          <span className="min-w-0 truncate">
                            Marked <strong className="font-medium">{e.role}</strong> as{" "}
                            <span className="text-[var(--accent)]">{e.field}</span>
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
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Current streak" value={viewStreak.current} hint="days" />
              <StatCard label="Longest streak" value={viewStreak.longest} hint="days" />
              <StatCard label="Completed" value={`${viewStats.completed}/${viewStats.total}`} />
              <StatCard label="Overall progress" value={`${viewStats.pct}%`} />
            </div>

            <div className="card-hover animate-fade-in-up mt-4 border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-center gap-2">
                <FlameIcon className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-sm font-semibold">Activity heatmap</h2>
              </div>
              <div className="mt-4 overflow-x-auto">
                <HeatmapCalendar activityByDate={viewActivity} mode="year" />
              </div>
            </div>

            <div
              className="animate-fade-in-up mt-4 border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ animationDelay: "80ms" }}
            >
              <h2 className="text-sm font-semibold">Recent updates</h2>
              {timeline.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Mark roles as researched, interested or completed to start building activity here.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--border)]">
                  {timeline.map((e, i) => (
                    <li key={`${e.date}-${e.role}-${e.field}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
                      <span>
                        Marked <strong className="font-medium">{e.role}</strong> as{" "}
                        <span className="text-[var(--accent)]">{e.field}</span>
                      </span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {new Date(e.date).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ))}

      {section === "courses" &&
        (view === "household" ? (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {PROFILES.map((p, i) => {
              const s = courseStatsForProfile(courses, courseProgressByProfile[p]);
              return (
                <div
                  key={p}
                  className="animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5"
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
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {PROFILES.map((p, i) => {
              const s = ideaStatsForProfile(p);
              return (
                <div
                  key={p}
                  className="animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5"
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
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {PROFILES.map((p, i) => {
              const s = researchStatsForProfile(p);
              return (
                <div
                  key={p}
                  className="animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <h2 className="text-base font-semibold">
                    {PROFILE_LABELS[p]}
                    {p === profile ? " (me)" : ""}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">{s.total} papers added</p>
                  <div className="mt-4 grid grid-cols-4 gap-2">
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
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {PROFILES.map((p, i) => {
              const s = freelanceStatsForProfile(p);
              return (
                <div
                  key={p}
                  className="animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <h2 className="text-base font-semibold">
                    {PROFILE_LABELS[p]}
                    {p === profile ? " (me)" : ""}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">{s.total} gigs added</p>
                  <div className="mt-4 grid grid-cols-4 gap-2">
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
