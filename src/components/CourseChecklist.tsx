"use client";

import { useEffect, useMemo, useState } from "react";
import type { Course, CourseTrack, CourseItem, ResourceType } from "@/types/course";
import { useAccess } from "@/context/AccessContext";
import {
  loadCourseProgress,
  saveCourseProgressLocal,
  fetchCourseProgress,
  syncCourseProgress,
  courseTotals,
  customKeyFor,
  customItemDoneCount,
} from "@/lib/courseProgress";
import ProgressRing from "@/components/ProgressRing";
import {
  ChevronDownIcon,
  PlayIcon,
  LinkIcon,
  BookIcon,
  CopyIcon,
  CheckIcon,
  GraduationCapIcon,
  FlameIcon,
} from "@/components/icons";

const CUSTOM_RESOURCE_ICONS: Record<ResourceType, typeof PlayIcon> = {
  youtube: PlayIcon,
  article: LinkIcon,
  docs: BookIcon,
  course: GraduationCapIcon,
  other: LinkIcon,
};

const CUSTOM_RESOURCE_LABELS: Record<ResourceType, string> = {
  youtube: "YouTube",
  article: "Article",
  docs: "Docs",
  course: "Course",
  other: "Link",
};

const TRACK_COLORS: Record<CourseTrack, string> = {
  core: "var(--accent)",
  backend: "#38bdf8",
  data: "#a78bfa",
  ai: "#f472b6",
  infra: "#34d399",
};

const PRIORITY_META: Record<number, { label: string; color: string }> = {
  5: { label: "Critical", color: "var(--bad)" },
  4: { label: "High", color: "var(--accent)" },
  0: { label: "Later", color: "var(--muted)" },
};

function HoverTip({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span className={`group/tip relative inline-block ${className}`}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--text)] px-2 py-1 text-[10px] font-medium text-[var(--surface)] opacity-0 shadow-lg transition-opacity duration-150 group-hover/tip:opacity-100">
        {label}
      </span>
    </span>
  );
}

function CustomChecklistItem({
  item,
  context,
  subState,
  onToggleSub,
}: {
  item: CourseItem;
  context: string;
  subState: Record<string, boolean>;
  onToggleSub: (substepId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const doneCount = item.substeps.filter((s) => subState[s.id]).length;
  const complete = item.substeps.length > 0 && doneCount === item.substeps.length;

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
    <div
      className={`card-hover rounded-2xl border bg-[var(--surface)] shadow-sm transition-colors ${
        open ? "border-[var(--accent)]" : "border-[var(--border)]"
      }`}
    >
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-3.5 p-4 text-left">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            complete
              ? "border-[var(--good)] bg-[var(--good)] text-white"
              : open
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]"
          }`}
        >
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold ${complete ? "text-[var(--muted)] line-through" : ""}`}>
            {item.title}
          </h4>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Part of {context}.</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            complete ? "border-[var(--good)] text-[var(--good)]" : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          {doneCount}/{item.substeps.length}
        </span>
      </button>

      {open && (
        <div className="animate-fade-in-up space-y-3 border-t border-[var(--border)] p-4 pt-3.5">
          {item.wholePrompt?.trim() ? (
            <button
              onClick={() => copy("whole", item.wholePrompt.trim())}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-left text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
            >
              <span>Ask ChatGPT about all of {item.title}</span>
              {copiedKey === "whole" ? <CheckIcon className="h-3.5 w-3.5 shrink-0" /> : <CopyIcon className="h-3.5 w-3.5 shrink-0" />}
            </button>
          ) : (
            <HoverTip label="Not added yet" className="w-full">
              <button
                disabled
                className="flex w-full cursor-not-allowed items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left text-xs font-medium text-[var(--muted)] opacity-60"
              >
                <span>Ask ChatGPT about all of {item.title}</span>
                <CopyIcon className="h-3.5 w-3.5 shrink-0" />
              </button>
            </HoverTip>
          )}

          {item.substeps.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">No learning points added yet.</p>
          ) : (
            <div className="space-y-2">
              {item.substeps.map((s, i) => {
                const checked = !!subState[s.id];
                const Icon = CUSTOM_RESOURCE_ICONS[s.resourceType];
                return (
                  <div key={s.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleSub(s.id)}
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
                        {s.whatYouLearn && (
                          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">{s.whatYouLearn}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 pl-9">
                      {s.resourceUrl ? (
                        <a
                          href={s.resourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={CUSTOM_RESOURCE_LABELS[s.resourceType]}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <HoverTip label="Not added yet">
                          <button
                            disabled
                            className="flex h-7 w-7 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] opacity-50"
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </button>
                        </HoverTip>
                      )}
                      {s.prompt ? (
                        <button
                          onClick={() => copy(s.id, s.prompt)}
                          title="Copy ChatGPT prompt"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          {copiedKey === s.id ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
                        </button>
                      ) : (
                        <HoverTip label="Not added yet">
                          <button
                            disabled
                            className="flex h-7 w-7 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] opacity-50"
                          >
                            <CopyIcon className="h-3.5 w-3.5" />
                          </button>
                        </HoverTip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CourseChecklist({ course }: { course: Course }) {
  const { profile } = useAccess();
  const [state, setState] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  useEffect(() => {
    if (!profile) return;
    // Local cache paints instantly; the database (fetched right after) is the
    // source of truth and overwrites it once it responds.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadCourseProgress(course.slug, profile));
    fetchCourseProgress(course.slug, profile).then((remote) => {
      if (remote) {
        setState(remote);
        saveCourseProgressLocal(course.slug, profile, remote);
      }
    });
  }, [course.slug, profile]);

  function toggleKey(key: string) {
    if (!profile) return;
    setState((prev) => {
      const nextDone = !prev[key];
      const next = { ...prev, [key]: nextDone };
      saveCourseProgressLocal(course.slug, profile, next);
      syncCourseProgress(course.slug, profile, key, nextDone);
      return next;
    });
  }

  const toggleSub = toggleKey;

  const { total, done } = useMemo(() => courseTotals(course, state), [state, course]);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const topicCount = useMemo(
    () => course.sections.reduce((sum, sec) => sum + (sec.customItems?.length || 0), 0),
    [course]
  );

  const priorityBreakdown = useMemo(() => {
    const buckets: Record<number, { total: number; done: number }> = {
      5: { total: 0, done: 0 },
      4: { total: 0, done: 0 },
      0: { total: 0, done: 0 },
    };
    course.sections.forEach((sec) => {
      let secDone = 0;
      let secTotal = 0;
      (sec.customItems || []).forEach((item) => {
        secTotal += item.substeps.length;
        secDone += customItemDoneCount(
          state,
          item.id,
          item.substeps.map((s) => s.id)
        );
      });
      buckets[sec.priority].total += secTotal;
      buckets[sec.priority].done += secDone;
    });
    return buckets;
  }, [course, state]);

  const encouragement =
    pct === 100
      ? "Course complete — great work!"
      : pct === 0
        ? "Just getting started — let's go!"
        : "Building mastery one topic at a time — keep the momentum going!";

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="animate-fade-in-up flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--good)] text-white shadow-sm">
              <GraduationCapIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">{course.subtitle}</p>
            </div>
          </div>

          <div className="animate-fade-in-up mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1">
              {course.sections.length} sections
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1">
              {topicCount} topics
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1">
              {total} sub-tasks
            </span>
          </div>

          <div className="animate-fade-in-up mt-4 flex flex-wrap gap-2">
            {(["all", "open", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
                }`}
              >
                {f === "all" ? "All" : f === "open" ? "Not done" : "Done"}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {course.sections.map((sec) => {
              let secTotal = 0;
              let secDone = 0;
              (sec.customItems || []).forEach((item) => {
                secTotal += item.substeps.length;
                secDone += customItemDoneCount(
                  state,
                  item.id,
                  item.substeps.map((s) => s.id)
                );
              });
              const secPct = secTotal ? Math.round((secDone / secTotal) * 100) : 0;
              const prio = PRIORITY_META[sec.priority];

              return (
                <div
                  key={sec.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                >
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <h2 className="min-w-0 truncate text-base font-bold">{sec.title}</h2>
                        {prio && (
                          <span
                            className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                            style={{ background: `${prio.color}1f`, color: prio.color }}
                          >
                            {prio.label}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {secTotal} sub-tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${secPct}%`, background: TRACK_COLORS[sec.track] }}
                        />
                      </div>
                      <span className="shrink-0 text-xs text-[var(--muted)]">
                        {secDone}/{secTotal}
                      </span>
                    </div>
                    {sec.note && <p className="text-xs leading-relaxed text-[var(--muted)]">{sec.note}</p>}
                  </div>

                  <div className="space-y-2.5 border-t border-[var(--border)] p-4">
                    {(sec.customItems || [])
                      .filter((item) => {
                        const d = customItemDoneCount(
                          state,
                          item.id,
                          item.substeps.map((s) => s.id)
                        );
                        const itemDone = item.substeps.length > 0 && d === item.substeps.length;
                        if (filter === "open" && itemDone) return false;
                        if (filter === "done" && !itemDone) return false;
                        return true;
                      })
                      .map((item) => {
                        const subState: Record<string, boolean> = {};
                        item.substeps.forEach((s) => {
                          subState[s.id] = !!state[customKeyFor(item.id, s.id)];
                        });
                        return (
                          <CustomChecklistItem
                            key={item.id}
                            item={item}
                            context={sec.title}
                            subState={subState}
                            onToggleSub={(substepId) => toggleSub(customKeyFor(item.id, substepId))}
                          />
                        );
                      })}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        <aside className="animate-fade-in-up space-y-4 lg:sticky lg:top-3 lg:h-fit">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <FlameIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{pct === 100 ? "Nicely done!" : "Keep pushing!"}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">{encouragement}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-4">
              <ProgressRing pct={pct} size={88} stroke={9} />
              <div>
                <div className="text-sm font-semibold">Total progress</div>
                <div className="text-xs text-[var(--muted)]">
                  {done}/{total}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {([5, 4, 0] as const).map((p) => {
                const b = priorityBreakdown[p];
                const bPct = b.total ? Math.round((b.done / b.total) * 100) : 0;
                const meta = PRIORITY_META[p];
                return (
                  <div key={p}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium" style={{ color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className="text-[var(--muted)]">
                        {b.done}/{b.total} · {bPct}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${bPct}%`, background: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
