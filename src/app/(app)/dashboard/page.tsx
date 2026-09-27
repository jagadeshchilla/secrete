"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  useAppState,
  stripEmoji,
  keyFor,
  statsForProfile,
  activityForProfile,
  streakForProfile,
  buildProgressEvents,
} from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import { useIdeas } from "@/context/IdeasContext";
import { PROFILES, PROFILE_LABELS, type Profile } from "@/config/access";
import type { StatusField } from "@/types/career";
import StatCard from "@/components/StatCard";
import ProgressRing from "@/components/ProgressRing";
import MonthCalendar from "@/components/MonthCalendar";
import { ROADMAP_DATA } from "@/data/roadmapData";
import { FlameIcon, GridIcon, RouteIcon, GraduationCapIcon, CalendarIcon, LightbulbIcon } from "@/components/icons";

const ROADMAP_ROLE_COUNT = Object.keys(ROADMAP_DATA).length;
const TOOL_COUNT = new Set(
  Object.values(ROADMAP_DATA).flatMap((entry) => entry.skills.flatMap((s) => s.items))
).size;

type View = "household" | Profile;

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
  | { kind: "idea"; date: string; by: Profile; title: string };

export default function Dashboard() {
  const { data, domains, progress, stats, activityByDate, streak } = useAppState();
  const { profile } = useAccess();
  const { ideas } = useIdeas();
  const [view, setView] = useState<View>(profile || "household");

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
      })),
    [data, progress]
  );

  const domainBreakdown = useMemo(
    () =>
      domains
        .map((domain) => {
          const roles = data.filter((r) => r.domain === domain);
          const completed = roles.filter((r) => {
            const entry = progress[keyFor(r)];
            if (view === "household") return PROFILES.some((p) => entry?.[p]?.completed);
            return !!entry?.[view]?.completed;
          }).length;
          return { domain, total: roles.length, completed };
        })
        .sort((a, b) => b.completed / b.total - a.completed / a.total || b.total - a.total),
    [domains, data, progress, view]
  );

  const domainComparison = useMemo(
    () =>
      domains
        .map((domain) => {
          const roles = data.filter((r) => r.domain === domain);
          const total = roles.length;
          const perProfileCompleted = PROFILES.map((p) => ({
            profile: p,
            completed: roles.filter((r) => progress[keyFor(r)]?.[p]?.completed).length,
          }));
          return { domain, total, perProfileCompleted };
        })
        .sort((a, b) => {
          const totalA = a.perProfileCompleted.reduce((s, x) => s + x.completed, 0);
          const totalB = b.perProfileCompleted.reduce((s, x) => s + x.completed, 0);
          return totalB / (b.total || 1) - totalA / (a.total || 1) || b.total - a.total;
        }),
    [domains, data, progress]
  );

  const householdTimeline = useMemo<HouseholdEvent[]>(() => {
    const progressEvents: HouseholdEvent[] = buildProgressEvents(data, progress, null, 15).map((e) => ({
      kind: "progress",
      date: e.date,
      by: e.by,
      field: e.field,
      role: e.role,
    }));
    const ideaEvents: HouseholdEvent[] = ideas.map((idea) => ({
      kind: "idea",
      date: idea.createdAt,
      by: idea.createdBy,
      title: idea.title,
    }));
    return [...progressEvents, ...ideaEvents].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 15);
  }, [data, progress, ideas]);

  const personalTimeline = useMemo<HouseholdEvent[]>(() => {
    if (view === "household") return [];
    const progressEvents: HouseholdEvent[] = buildProgressEvents(data, progress, view, 15).map((e) => ({
      kind: "progress",
      date: e.date,
      by: e.by,
      field: e.field,
      role: e.role,
    }));
    const ideaEvents: HouseholdEvent[] = ideas
      .filter((idea) => idea.createdBy === view)
      .map((idea) => ({ kind: "idea", date: idea.createdAt, by: idea.createdBy, title: idea.title }));
    return [...progressEvents, ...ideaEvents].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 15);
  }, [data, progress, ideas, view]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Your career research at a glance. Pick up where you left off.
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

      {view === "household" ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {perProfile.map(({ profile: p, stats: pStats, activity: pActivity, streak: pStreak }, i) => (
              <div
                key={p}
                className="animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <button onClick={() => setView(p)} className="flex w-full items-center justify-between text-left">
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

                <div className="mt-4 border-t border-[var(--border)] pt-4">
                  <MonthCalendar activityByDate={pActivity} />
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5"
            style={{ animationDelay: "120ms" }}
          >
            <h2 className="text-sm font-semibold">Domain progress comparison</h2>
            <div className="mt-4 space-y-4">
              {domainComparison.map(({ domain, total, perProfileCompleted }) => (
                <div key={domain}>
                  <div className="text-xs font-medium">{stripEmoji(domain)}</div>
                  <div className="mt-1.5 space-y-1.5">
                    {perProfileCompleted.map(({ profile: p, completed }) => {
                      const pct = total ? Math.round((completed / total) * 100) : 0;
                      return (
                        <div key={p} className="flex items-center gap-2">
                          <span className="w-16 shrink-0 text-[11px] text-[var(--muted)]">
                            {PROFILE_LABELS[p]}
                          </span>
                          <div className="h-1.5 flex-1 bg-[var(--border)]">
                            <div
                              className="h-full bg-[var(--accent)] transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-[11px] text-[var(--muted)]">
                            {completed}/{total}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-4 animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent activity</h2>
              <Link href="/progress" className="text-xs font-medium text-[var(--accent)] hover:underline">
                View full calendar →
              </Link>
            </div>
            {householdTimeline.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted)]">
                Mark roles as researched, interested or completed to start building activity here.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--border)]">
                {householdTimeline.map((e, i) => (
                  <li key={`${e.kind}-${e.date}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex min-w-0 items-center gap-1.5 truncate">
                      {e.kind === "idea" && <LightbulbIcon className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />}
                      <span className="min-w-0 truncate">
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
        </>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="animate-fade-in-up" style={{ animationDelay: "40ms" }}>
              <StatCard label="Total roles" value={viewStats.total} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
              <StatCard label="Researched" value={viewStats.researched} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <StatCard label="Interested" value={viewStats.interested} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>
              <StatCard label="Completed" value={viewStats.completed} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link
              href="/roadmap"
              className="card-hover animate-fade-in-up flex items-center gap-3 border border-[var(--border)] bg-[var(--surface)] p-4"
              style={{ animationDelay: "40ms" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <RouteIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Roadmap</div>
                <div className="text-xs text-[var(--muted)]">{ROADMAP_ROLE_COUNT} role paths mapped</div>
              </div>
            </Link>
            <Link
              href="/courses"
              className="card-hover animate-fade-in-up flex items-center gap-3 border border-[var(--border)] bg-[var(--surface)] p-4"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <GraduationCapIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Courses</div>
                <div className="text-xs text-[var(--muted)]">{TOOL_COUNT} tools to learn</div>
              </div>
            </Link>
            <Link
              href="/progress"
              className="card-hover animate-fade-in-up flex items-center gap-3 border border-[var(--border)] bg-[var(--surface)] p-4"
              style={{ animationDelay: "120ms" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Progress</div>
                <div className="text-xs text-[var(--muted)]">
                  {viewStreak.current} day streak · full calendar
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="card-hover animate-fade-in-up flex flex-col items-center justify-center gap-3 border border-[var(--border)] bg-[var(--surface)] p-6">
              <ProgressRing pct={viewStats.pct} label="complete" />
              <Link
                href="/roles"
                className="btn-shimmer inline-flex items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
              >
                <GridIcon className="h-4 w-4" />
                Continue exploring
              </Link>
            </div>

            <div
              className="card-hover animate-fade-in-up lg:col-span-2 border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recent activity</h2>
                <Link href="/progress" className="text-xs font-medium text-[var(--accent)] hover:underline">
                  View full calendar →
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[260px] flex-1">
                  <MonthCalendar activityByDate={viewActivity} />
                </div>
                <div className="flex gap-4 border-l border-[var(--border)] pl-4">
                  <div>
                    <div className="flex items-center gap-1 text-lg font-semibold">
                      <FlameIcon className="h-4 w-4 text-[var(--accent)]" />
                      {viewStreak.current}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">Day streak</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{viewStreak.longest}</div>
                    <div className="text-[11px] text-[var(--muted)]">Longest streak</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[var(--border)] pt-3">
                {personalTimeline.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    Mark roles as researched, interested or completed to start building activity here.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--border)]">
                    {personalTimeline.map((e, i) => (
                      <li key={`${e.kind}-${e.date}-${i}`} className="flex items-center justify-between py-2 text-sm">
                        <span className="flex min-w-0 items-center gap-1.5 truncate">
                          {e.kind === "idea" && (
                            <LightbulbIcon className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                          )}
                          <span className="min-w-0 truncate">
                            {e.kind === "idea" ? (
                              <>
                                Added the idea <strong className="font-medium">{e.title}</strong>
                              </>
                            ) : (
                              <>
                                {actionVerb(e.field)} <strong className="font-medium">{e.role}</strong>
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
          </div>

          <div className="mt-4 animate-fade-in-up border border-[var(--border)] bg-[var(--surface)] p-5" style={{ animationDelay: "120ms" }}>
            <h2 className="text-sm font-semibold">Domain progress</h2>
            <div className="mt-4 space-y-3">
              {domainBreakdown.map(({ domain, total, completed }) => {
                const pct = total ? Math.round((completed / total) * 100) : 0;
                return (
                  <div key={domain}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{stripEmoji(domain)}</span>
                      <span className="text-[var(--muted)]">
                        {completed}/{total}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-[var(--border)]">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
