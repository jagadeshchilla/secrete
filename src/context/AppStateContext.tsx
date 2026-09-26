"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import careerDataRaw from "@/data/careerData.json";
import type { CareerRole, ProgressRecord, ProgressState, StatusField } from "@/types/career";
import { useAccess } from "@/context/AccessContext";
import { PROFILES, type Profile } from "@/config/access";

const DATA = careerDataRaw as CareerRole[];
const PROGRESS_KEY = "careerResearchProgress";
const THEME_KEY = "themePreference";

export function keyFor(item: CareerRole) {
  return `${item.domain}||${item.role}`;
}

// Source data prefixes each domain with a decorative emoji; we show a proper
// icon in the UI instead and strip the emoji from the displayed label only —
// the underlying data (careerData.json) is left untouched.
export function stripEmoji(domain: string) {
  return domain.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

function todayKey(d: Date = new Date()) {
  return d.toISOString().slice(0, 10);
}

function computeStreak(activityByDate: Map<string, number>) {
  let current = 0;
  let longest = 0;
  let running = 0;
  const cursor = new Date();
  for (;;) {
    const k = todayKey(cursor);
    if (activityByDate.has(k)) {
      current += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (k === todayKey()) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  const days = [...activityByDate.keys()].sort();
  let prev: string | null = null;
  days.forEach((day) => {
    if (prev) {
      const prevDate = new Date(prev);
      prevDate.setDate(prevDate.getDate() + 1);
      running = todayKey(prevDate) === day ? running + 1 : 1;
    } else {
      running = 1;
    }
    longest = Math.max(longest, running);
    prev = day;
  });
  return { current, longest };
}

// Per-profile views (Dashboard/Progress "My progress" vs "Partner's progress" tabs).
// Each role now tracks Jagadesh's and Harshita's own status independently, so
// these read straight off progress[roleKey][profile] rather than a shared flag.
export function statsForProfile(data: CareerRole[], progress: ProgressState, profile: Profile) {
  const total = data.length;
  const researched = data.filter((x) => progress[keyFor(x)]?.[profile]?.researched).length;
  const interested = data.filter((x) => progress[keyFor(x)]?.[profile]?.interested).length;
  const completed = data.filter((x) => progress[keyFor(x)]?.[profile]?.completed).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  return { total, researched, interested, completed, pct };
}

export function activityForProfile(progress: ProgressState, profile: Profile) {
  const map = new Map<string, number>();
  Object.values(progress).forEach((entry) => {
    const rec = entry[profile];
    if (!rec) return;
    [rec.researchedAt, rec.interestedAt, rec.completedAt, rec.savedAt].forEach((ts) => {
      if (!ts) return;
      const day = ts.slice(0, 10);
      map.set(day, (map.get(day) || 0) + 1);
    });
  });
  return map;
}

export function streakForProfile(progress: ProgressState, profile: Profile) {
  return computeStreak(activityForProfile(progress, profile));
}

export interface ProgressEvent {
  date: string;
  role: string;
  field: StatusField;
  by: Profile;
}

// Shared by the Dashboard and Progress pages: flattens every (role, profile)
// status change into a single sorted feed, optionally scoped to one profile.
export function buildProgressEvents(
  data: CareerRole[],
  progress: ProgressState,
  forProfile: Profile | null,
  limit = 15
) {
  const events: ProgressEvent[] = [];
  const profiles = forProfile ? [forProfile] : PROFILES;
  data.forEach((role) => {
    const entry = progress[keyFor(role)];
    if (!entry) return;
    profiles.forEach((p) => {
      const rec = entry[p];
      if (!rec) return;
      (["researched", "interested", "completed", "saved"] as const).forEach((field) => {
        const ts = rec[`${field}At` as const];
        if (ts && rec[field]) events.push({ date: ts, role: role.role, field, by: p });
      });
    });
  });
  return events.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit);
}

interface AppState {
  data: CareerRole[];
  domains: string[];
  progress: ProgressState;
  getRecord: (item: CareerRole) => ProgressRecord;
  setStatus: (item: CareerRole, field: StatusField, value: boolean) => void;
  setNote: (item: CareerRole, value: string) => void;
  stats: { total: number; researched: number; interested: number; completed: number; pct: number };
  activityByDate: Map<string, number>;
  streak: { current: number; longest: number };
  theme: "light" | "dark";
  toggleTheme: () => void;
  exportProgress: () => string;
  importProgress: (json: string) => boolean;
}

const AppStateCtx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAccess();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [progress, setProgress] = useState<ProgressState>({});
  const [hydrated, setHydrated] = useState(false);
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingNotes = useRef<Record<string, { roleKey: string; profile: Profile; record: ProgressRecord }>>({});

  // Local cache paints instantly; the database (fetched right after) is the
  // source of truth and overwrites it once it responds.
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(THEME_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
      const storedProgress = localStorage.getItem(PROGRESS_KEY);
      if (storedProgress) setProgress(JSON.parse(storedProgress));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);

    fetch("/api/progress")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.progress) setProgress(json.progress);
      })
      .catch(() => {
        // offline or DB not configured yet — keep the local cache
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      // ignore write failures
    }
  }, [progress, hydrated]);

  const syncRecord = useCallback((roleKey: string, forProfile: Profile, record: ProgressRecord) => {
    // keepalive lets this request finish even if the tab closes or navigates
    // away right after firing — otherwise a reload right after a click could
    // race the in-flight write and read back stale data.
    fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleKey, profile: forProfile, record }),
      keepalive: true,
    }).catch(() => {
      // offline or DB not configured yet — local cache still has it
    });
  }, []);

  // If the tab is closed/backgrounded while a note edit is still sitting in
  // its 600ms debounce, the pending setTimeout would never fire and that
  // edit would be lost. Flush every pending note sync immediately instead.
  useEffect(() => {
    function flushPendingNotes() {
      Object.entries(pendingNotes.current).forEach(([timerKey, { roleKey, profile: p, record }]) => {
        clearTimeout(noteTimers.current[timerKey]);
        syncRecord(roleKey, p, record);
      });
      pendingNotes.current = {};
    }
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") flushPendingNotes();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", flushPendingNotes);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", flushPendingNotes);
    };
  }, [syncRecord]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // ignore write failures
      }
      return next;
    });
  }, []);

  const getRecord = useCallback(
    (item: CareerRole) => (profile ? progress[keyFor(item)]?.[profile] || {} : {}),
    [progress, profile]
  );

  const setStatus = useCallback(
    (item: CareerRole, field: StatusField, value: boolean) => {
      if (!profile) return;
      const k = keyFor(item);
      const stampField = `${field}At` as const;
      setProgress((prev) => {
        const roleEntry = prev[k] || {};
        const existing = roleEntry[profile] || {};
        const nextRecord: ProgressRecord = {
          ...existing,
          [field]: value,
          [stampField]: value ? existing[stampField] || new Date().toISOString() : existing[stampField],
        };
        syncRecord(k, profile, nextRecord);
        return { ...prev, [k]: { ...roleEntry, [profile]: nextRecord } };
      });
    },
    [profile, syncRecord]
  );

  const setNote = useCallback(
    (item: CareerRole, value: string) => {
      if (!profile) return;
      const k = keyFor(item);
      const timerKey = `${k}::${profile}`;
      setProgress((prev) => {
        const roleEntry = prev[k] || {};
        const nextRecord: ProgressRecord = { ...roleEntry[profile], notes: value };
        clearTimeout(noteTimers.current[timerKey]);
        pendingNotes.current[timerKey] = { roleKey: k, profile, record: nextRecord };
        noteTimers.current[timerKey] = setTimeout(() => {
          delete pendingNotes.current[timerKey];
          syncRecord(k, profile, nextRecord);
        }, 600);
        return { ...prev, [k]: { ...roleEntry, [profile]: nextRecord } };
      });
    },
    [profile, syncRecord]
  );

  const domains = useMemo(() => [...new Set(DATA.map((x) => x.domain))], []);

  const stats = useMemo(() => {
    const total = DATA.length;
    const touchedByAnyone = (field: StatusField) =>
      DATA.filter((x) => PROFILES.some((p) => progress[keyFor(x)]?.[p]?.[field])).length;
    const researched = touchedByAnyone("researched");
    const interested = touchedByAnyone("interested");
    const completed = touchedByAnyone("completed");
    const pct = total ? Math.round((completed / total) * 100) : 0;
    return { total, researched, interested, completed, pct };
  }, [progress]);

  const activityByDate = useMemo(() => {
    const map = new Map<string, number>();
    Object.values(progress).forEach((entry) => {
      PROFILES.forEach((p) => {
        const rec = entry[p];
        if (!rec) return;
        [rec.researchedAt, rec.interestedAt, rec.completedAt, rec.savedAt].forEach((ts) => {
          if (!ts) return;
          const day = ts.slice(0, 10);
          map.set(day, (map.get(day) || 0) + 1);
        });
      });
    });
    return map;
  }, [progress]);

  const streak = useMemo(() => computeStreak(activityByDate), [activityByDate]);

  const exportProgress = useCallback(
    () => JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), progress }, null, 2),
    [progress]
  );

  const importProgress = useCallback(
    (json: string) => {
      try {
        const obj = JSON.parse(json);
        const incoming: ProgressState = obj.progress || obj;
        setProgress((prev) => ({ ...prev, ...incoming }));
        Object.entries(incoming).forEach(([roleKey, entry]) => {
          PROFILES.forEach((p) => {
            const record = entry[p];
            if (record) syncRecord(roleKey, p, record);
          });
        });
        return true;
      } catch {
        return false;
      }
    },
    [syncRecord]
  );

  const value: AppState = {
    data: DATA,
    domains,
    progress,
    getRecord,
    setStatus,
    setNote,
    stats,
    activityByDate,
    streak,
    theme,
    toggleTheme,
    exportProgress,
    importProgress,
  };

  return <AppStateCtx.Provider value={value}>{children}</AppStateCtx.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateCtx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
