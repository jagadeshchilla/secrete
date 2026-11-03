"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Habit } from "@/types/habits";
import type { Profile } from "@/config/access";
import { todayKey } from "@/lib/dateKey";

const STORAGE_KEY = "careerHabits";

type HabitPatch = Partial<Pick<Habit, "title" | "description" | "checkIns">>;

interface HabitsState {
  habits: Habit[];
  hydrated: boolean;
  addHabit: (input: {
    title: string;
    description?: string;
    durationDays: number;
    startDate?: string;
    createdBy: Profile;
  }) => void;
  updateHabit: (id: string, patch: HabitPatch) => void;
  removeHabit: (id: string) => void;
}

const HabitsCtx = createContext<HabitsState | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setHabits(JSON.parse(stored));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);

    fetch("/api/habits")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.habits) setHabits(json.habits);
      })
      .catch(() => {
        // offline or DB not configured yet — keep the local cache
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch {
      // ignore write failures
    }
  }, [habits, hydrated]);

  const addHabit = useCallback((input: Parameters<HabitsState["addHabit"]>[0]) => {
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const habit: Habit = {
      id: tempId,
      title: input.title,
      description: input.description,
      durationDays: input.durationDays,
      startDate: input.startDate || todayKey(),
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      checkIns: {},
    };
    setHabits((prev) => [habit, ...prev]);
    fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      keepalive: true,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        // The server mints its own id on insert — swap the optimistic temp id
        // for the real one, otherwise any edit/delete made before the next
        // page load would target an id that doesn't exist in the database.
        if (json?.habit) {
          setHabits((prev) => prev.map((h) => (h.id === tempId ? json.habit : h)));
        }
      })
      .catch(() => {
        // offline or DB not configured yet — local cache still has it
      });
  }, []);

  const updateHabit = useCallback((id: string, patch: HabitPatch) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
    fetch("/api/habits", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, patch }),
      keepalive: true,
    }).catch(() => {
      // offline or DB not configured yet — local cache still has it
    });
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    fetch(`/api/habits?id=${encodeURIComponent(id)}`, { method: "DELETE", keepalive: true }).catch(() => {
      // offline or DB not configured yet — local cache still reflects the removal
    });
  }, []);

  return (
    <HabitsCtx.Provider value={{ habits, hydrated, addHabit, updateHabit, removeHabit }}>
      {children}
    </HabitsCtx.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitsCtx);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}
