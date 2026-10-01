"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ResearchPaper, ResearchStatus } from "@/types/research";
import type { Profile } from "@/config/access";

const STORAGE_KEY = "careerResearchPapers";

interface ResearchState {
  papers: ResearchPaper[];
  hydrated: boolean;
  addPaper: (input: {
    title: string;
    abstract: string;
    status: ResearchStatus;
    link?: string;
    domains: string[];
    roleKeys: string[];
    createdBy: Profile;
  }) => void;
  setStatus: (id: string, status: ResearchStatus) => void;
  removePaper: (id: string) => void;
}

const ResearchCtx = createContext<ResearchState | null>(null);

export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setPapers(JSON.parse(stored));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);

    fetch("/api/research")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.papers) setPapers(json.papers);
      })
      .catch(() => {
        // offline or DB not configured yet — keep the local cache
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    } catch {
      // ignore write failures
    }
  }, [papers, hydrated]);

  const addPaper = useCallback(
    (input: {
      title: string;
      abstract: string;
      status: ResearchStatus;
      link?: string;
      domains: string[];
      roleKeys: string[];
      createdBy: Profile;
    }) => {
      const paper: ResearchPaper = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: input.title,
        abstract: input.abstract,
        status: input.status,
        link: input.link,
        domains: input.domains,
        roleKeys: input.roleKeys,
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
      };
      setPapers((prev) => [paper, ...prev]);
      fetch("/api/research", {
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

  const setStatus = useCallback((id: string, status: ResearchStatus) => {
    setPapers((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    fetch("/api/research", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
      keepalive: true,
    }).catch(() => {
      // offline or DB not configured yet — local cache still has it
    });
  }, []);

  const removePaper = useCallback((id: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/research?id=${encodeURIComponent(id)}`, { method: "DELETE", keepalive: true }).catch(() => {
      // offline or DB not configured yet — local cache still reflects the removal
    });
  }, []);

  return (
    <ResearchCtx.Provider value={{ papers, hydrated, addPaper, setStatus, removePaper }}>
      {children}
    </ResearchCtx.Provider>
  );
}

export function useResearch() {
  const ctx = useContext(ResearchCtx);
  if (!ctx) throw new Error("useResearch must be used within ResearchProvider");
  return ctx;
}
