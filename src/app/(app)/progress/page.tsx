"use client";

import { useMemo, useState } from "react";
import {
  useAppState,
  statsForProfile,
  activityForProfile,
  streakForProfile,
  buildProgressEvents,
} from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import { PROFILES, PROFILE_LABELS, type Profile } from "@/config/access";
import StatCard from "@/components/StatCard";
import HeatmapCalendar from "@/components/HeatmapCalendar";
import { FlameIcon } from "@/components/icons";

type View = "household" | Profile;

export default function ProgressPage() {
  const { data, progress, activityByDate, streak, stats } = useAppState();
  const { profile } = useAccess();
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
        timeline: buildProgressEvents(data, progress, p, 12),
      })),
    [data, progress]
  );

  const timeline = useMemo(
    () => buildProgressEvents(data, progress, view === "household" ? null : view, 12),
    [data, progress, view]
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Your research activity over time — stay consistent, build a streak.
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
      )}
    </div>
  );
}
