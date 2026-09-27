"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ProjectIdea } from "@/types/ideas";
import type { Profile } from "@/config/access";

const STORAGE_KEY = "careerProjectIdeas";

interface IdeasState {
  ideas: ProjectIdea[];
  hydrated: boolean;
  addIdea: (input: {
    title: string;
    description: string;
    domains: string[];
    roleKeys: string[];
    createdBy: Profile;
  }) => void;
  removeIdea: (id: string) => void;
}

const IdeasCtx = createContext<IdeasState | null>(null);

export function IdeasProvider({ children }: { children: React.ReactNode }) {
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setIdeas(JSON.parse(stored));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);

    fetch("/api/ideas")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.ideas) setIdeas(json.ideas);
      })
      .catch(() => {
        // offline or DB not configured yet — keep the local cache
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    } catch {
      // ignore write failures
    }
  }, [ideas, hydrated]);

  const addIdea = useCallback(
    (input: {
      title: string;
      description: string;
      domains: string[];
      roleKeys: string[];
      createdBy: Profile;
    }) => {
      const idea: ProjectIdea = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: input.title,
        description: input.description,
        domains: input.domains,
        roleKeys: input.roleKeys,
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
      };
      setIdeas((prev) => [idea, ...prev]);
      fetch("/api/ideas", {
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

  const removeIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/ideas?id=${encodeURIComponent(id)}`, { method: "DELETE", keepalive: true }).catch(() => {
      // offline or DB not configured yet — local cache still reflects the removal
    });
  }, []);

  return (
    <IdeasCtx.Provider value={{ ideas, hydrated, addIdea, removeIdea }}>{children}</IdeasCtx.Provider>
  );
}

export function useIdeas() {
  const ctx = useContext(IdeasCtx);
  if (!ctx) throw new Error("useIdeas must be used within IdeasProvider");
  return ctx;
}
