"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Profile } from "@/config/access";

const UNLOCK_KEY = "siteUnlocked";
const PROFILE_KEY = "activeProfile";

interface AccessState {
  hydrated: boolean;
  unlocked: boolean;
  profile: Profile | null;
  unlock: (password: string) => Promise<boolean>;
  chooseProfile: (p: Profile) => void;
  lock: () => void;
}

const AccessCtx = createContext<AccessState | null>(null);

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [profile, setProfileState] = useState<Profile | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem(UNLOCK_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (u === "1") setUnlocked(true);
      const p = localStorage.getItem(PROFILE_KEY);
      if (p === "jagadesh" || p === "harshita") setProfileState(p);
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  const unlock = useCallback(async (password: string) => {
    try {
      const res = await fetch("/api/auth/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!json.ok) return false;
      setUnlocked(true);
      try {
        localStorage.setItem(UNLOCK_KEY, "1");
      } catch {
        // ignore write failures
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const chooseProfile = useCallback((p: Profile) => {
    setProfileState(p);
    try {
      localStorage.setItem(PROFILE_KEY, p);
    } catch {
      // ignore write failures
    }
  }, []);

  const lock = useCallback(() => {
    setUnlocked(false);
    setProfileState(null);
    try {
      localStorage.removeItem(UNLOCK_KEY);
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      // ignore write failures
    }
    // A plain navigation (not the App Router hook) — this can be called from
    // deep in the tree before the router context is guaranteed to be ready.
    window.location.href = "/";
  }, []);

  return (
    <AccessCtx.Provider value={{ hydrated, unlocked, profile, unlock, chooseProfile, lock }}>
      {children}
    </AccessCtx.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessCtx);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}
