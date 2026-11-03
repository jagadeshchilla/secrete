"use client";

import { useMemo, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import { useHabits } from "@/context/HabitsContext";
import { PROFILES, PROFILE_LABELS, type Profile } from "@/config/access";
import { habitStats } from "@/lib/habits";
import type { Habit } from "@/types/habits";
import EmptyState from "@/components/EmptyState";
import { FlameIcon, PlusIcon, CheckIcon, TrashIcon, CloseIcon } from "@/components/icons";

type View = "household" | Profile;

const DURATION_PRESETS = [30, 60, 90];

function DayGrid({ habit, cellSize = 10 }: { habit: Habit; cellSize?: number }) {
  const { days, today } = habitStats(habit);
  return (
    <div className="flex flex-wrap gap-1">
      {days.map((day) => {
        const done = !!habit.checkIns[day];
        const isFuture = day > today;
        const isPastMissed = !isFuture && !done;
        return (
          <div
            key={day}
            title={day}
            className="shrink-0 rounded-[3px] border"
            style={{
              height: cellSize,
              width: cellSize,
              background: done ? "var(--good)" : isPastMissed ? "var(--bad-soft)" : "transparent",
              borderColor: isFuture ? "var(--border)" : done ? "var(--good)" : "var(--bad-soft)",
            }}
          />
        );
      })}
    </div>
  );
}

function HabitCard({ habit, onToggleToday, onRemove }: { habit: Habit; onToggleToday: () => void; onRemove: () => void }) {
  const stats = habitStats(habit);
  const doneToday = !!habit.checkIns[stats.today];

  return (
    <div className="surface-card animate-fade-in-up p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{habit.title}</h3>
            {stats.completed && (
              <span className="shrink-0 rounded-full border border-[var(--good)] bg-[var(--good-soft)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--good)]">
                Completed
              </span>
            )}
          </div>
          {habit.description && (
            <p className="mt-0.5 text-xs text-[var(--muted)]">{habit.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          title="Delete habit"
          className="shrink-0 text-[var(--muted)] hover:text-[var(--bad)]"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--good)] transition-all duration-700 ease-out"
          style={{ width: `${stats.completionPct}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <span>
          Day {Math.min(stats.elapsedCount, habit.durationDays)}/{habit.durationDays} ·{" "}
          <span className="font-medium text-[var(--text)]">{stats.currentStreak}</span> day streak ·{" "}
          {stats.completed ? "finished" : `${stats.daysRemaining} days left`}
        </span>
        {!stats.completed && (
          <button
            type="button"
            onClick={onToggleToday}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              doneToday
                ? "border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]"
                : "btn-shimmer border-[var(--accent)] bg-[var(--accent)] text-white"
            }`}
          >
            {doneToday ? <CheckIcon className="h-3.5 w-3.5" /> : null}
            {doneToday ? "Done today" : "Mark today done"}
          </button>
        )}
      </div>

      <div className="mt-4">
        <DayGrid habit={habit} />
      </div>
    </div>
  );
}

function NewHabitForm({ onCreate, onClose }: { onCreate: (input: { title: string; description?: string; durationDays: number }) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  function submit() {
    const days = useCustom ? parseInt(customDuration, 10) : duration;
    if (!title.trim() || !Number.isInteger(days) || days <= 0) return;
    onCreate({ title: title.trim(), description: description.trim() || undefined, durationDays: days });
    setTitle("");
    setDescription("");
    setDuration(30);
    setCustomDuration("");
    setUseCustom(false);
    onClose();
  }

  const inputCls =
    "w-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--accent)]";

  return (
    <div className="surface-card animate-fade-in-up p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New habit</h3>
        <button type="button" onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 space-y-2.5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Practice DSA daily"
          autoFocus
          className={inputCls}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={2}
          className={inputCls}
        />
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Duration</p>
          <div className="flex flex-wrap gap-1.5">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDuration(d);
                  setUseCustom(false);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  !useCustom && duration === d
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                {d} days
              </button>
            ))}
            <button
              type="button"
              onClick={() => setUseCustom(true)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                useCustom
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              Custom
            </button>
            {useCustom && (
              <input
                type="number"
                min={1}
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="Days"
                className="w-24 border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs outline-none focus:border-[var(--accent)]"
              />
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!title.trim() || (useCustom && !customDuration)}
          className="btn-shimmer w-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          Start habit
        </button>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const { profile } = useAccess();
  const { habits, addHabit, updateHabit, removeHabit } = useHabits();
  const [view, setView] = useState<View>(profile || "household");
  const [showForm, setShowForm] = useState(false);

  const mine = useMemo(
    () => (view === "household" ? habits : habits.filter((h) => h.createdBy === view)),
    [habits, view]
  );

  const { active, completed } = useMemo(() => {
    const active: Habit[] = [];
    const completed: Habit[] = [];
    mine.forEach((h) => (habitStats(h).completed ? completed.push(h) : active.push(h)));
    return { active, completed };
  }, [mine]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Commit to something every day for a set number of days, and track whether you did it.
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

      <div className="mt-6">
        {showForm ? (
          <NewHabitForm
            onCreate={(input) =>
              addHabit({ ...input, createdBy: view === "household" ? profile || "jagadesh" : view })
            }
            onClose={() => setShowForm(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="card-hover surface-card flex w-full items-center justify-center gap-2 p-4 text-sm font-medium text-[var(--accent)]"
          >
            <PlusIcon className="h-4 w-4" />
            New habit
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {active.length === 0 && completed.length === 0 ? (
          <EmptyState icon={FlameIcon} message="No habits yet — start one above to track a daily commitment." />
        ) : (
          active.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onToggleToday={() => {
                const { today } = habitStats(h);
                updateHabit(h.id, { checkIns: { ...h.checkIns, [today]: !h.checkIns[today] } });
              }}
              onRemove={() => removeHabit(h.id)}
            />
          ))
        )}
      </div>

      {completed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-[var(--muted)]">Completed</h2>
          <div className="mt-3 space-y-3 opacity-80">
            {completed.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                onToggleToday={() => {
                  const { today } = habitStats(h);
                  updateHabit(h.id, { checkIns: { ...h.checkIns, [today]: !h.checkIns[today] } });
                }}
                onRemove={() => removeHabit(h.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
