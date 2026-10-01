"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { FreelanceGig, FreelanceStatus } from "@/types/freelance";
import type { Profile } from "@/config/access";

const STORAGE_KEY = "careerFreelanceGigs";

interface FreelanceState {
  gigs: FreelanceGig[];
  hydrated: boolean;
  addGig: (input: {
    title: string;
    description: string;
    status: FreelanceStatus;
    link?: string;
    budget?: string;
    domains: string[];
    roleKeys: string[];
    createdBy: Profile;
  }) => void;
  setStatus: (id: string, status: FreelanceStatus) => void;
  removeGig: (id: string) => void;
}

const FreelanceCtx = createContext<FreelanceState | null>(null);

export function FreelanceProvider({ children }: { children: React.ReactNode }) {
  const [gigs, setGigs] = useState<FreelanceGig[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setGigs(JSON.parse(stored));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);

    fetch("/api/freelance")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.gigs) setGigs(json.gigs);
      })
      .catch(() => {
        // offline or DB not configured yet — keep the local cache
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gigs));
    } catch {
      // ignore write failures
    }
  }, [gigs, hydrated]);

  const addGig = useCallback(
    (input: {
      title: string;
      description: string;
      status: FreelanceStatus;
      link?: string;
      budget?: string;
      domains: string[];
      roleKeys: string[];
      createdBy: Profile;
    }) => {
      const gig: FreelanceGig = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: input.title,
        description: input.description,
        status: input.status,
        link: input.link,
        budget: input.budget,
        domains: input.domains,
        roleKeys: input.roleKeys,
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
      };
      setGigs((prev) => [gig, ...prev]);
      fetch("/api/freelance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        keepalive: true,
      }).catch(() => {
        // offline or DB not configured yet — local cache still has it
      });
    },
    []
  );

  const setStatus = useCallback((id: string, status: FreelanceStatus) => {
    setGigs((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
    fetch("/api/freelance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
      keepalive: true,
    }).catch(() => {
      // offline or DB not configured yet — local cache still has it
    });
  }, []);

  const removeGig = useCallback((id: string) => {
    setGigs((prev) => prev.filter((g) => g.id !== id));
    fetch(`/api/freelance?id=${encodeURIComponent(id)}`, { method: "DELETE", keepalive: true }).catch(() => {
      // offline or DB not configured yet — local cache still reflects the removal
    });
  }, []);

  return (
    <FreelanceCtx.Provider value={{ gigs, hydrated, addGig, setStatus, removeGig }}>
      {children}
    </FreelanceCtx.Provider>
  );
}

export function useFreelance() {
  const ctx = useContext(FreelanceCtx);
  if (!ctx) throw new Error("useFreelance must be used within FreelanceProvider");
  return ctx;
}
