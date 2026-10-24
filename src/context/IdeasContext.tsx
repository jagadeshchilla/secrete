"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ProjectIdea } from "@/types/ideas";
import type { Profile } from "@/config/access";
import { normalizePromptItems } from "@/lib/ideaPromptItems";

const STORAGE_KEY = "careerProjectIdeas";

// A browser's localStorage cache can predate the researchTopics/methods
// shape change (plain strings -> {id, text, prompt?}) — normalize on every
// load path so the rest of the app never has to special-case the old shape.
function normalizeIdea(idea: ProjectIdea): ProjectIdea {
  return {
    ...idea,
    researchTopics: normalizePromptItems(idea.researchTopics),
    methods: normalizePromptItems(idea.methods),
  };
}

type IdeaPatch = Partial<
  Pick<
    ProjectIdea,
    | "title"
    | "description"
    | "researchTopics"
    | "dataSources"
    | "methods"
    | "techStack"
    | "tasks"
    | "targetDate"
    | "blockers"
    | "outcomeNotes"
    | "researchPaperLink"
    | "chatgptProjectLink"
    | "githubUrl"
    | "done"
    | "feasible"
    | "infeasibleReason"
  >
>;

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
  updateIdea: (id: string, patch: IdeaPatch) => void;
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
      if (stored) setIdeas((JSON.parse(stored) as ProjectIdea[]).map(normalizeIdea));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);

    fetch("/api/ideas")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.ideas) setIdeas((json.ideas as ProjectIdea[]).map(normalizeIdea));
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

  const addIdea = useCallback((input: Parameters<IdeasState["addIdea"]>[0]) => {
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const idea: ProjectIdea = {
      id: tempId,
      title: input.title,
      description: input.description,
      domains: input.domains,
      roleKeys: input.roleKeys,
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
      feasible: null,
      researchTopics: [],
      dataSources: [],
      methods: [],
      techStack: [],
      tasks: [],
      done: false,
    };
    setIdeas((prev) => [idea, ...prev]);
    fetch("/api/ideas", {
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
        if (json?.idea) {
          setIdeas((prev) => prev.map((i) => (i.id === tempId ? json.idea : i)));
        }
      })
      .catch(() => {
        // offline or DB not configured yet — local cache still has it
      });
  }, []);

  const updateIdea = useCallback((id: string, patch: IdeaPatch) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    fetch("/api/ideas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, patch }),
      keepalive: true,
    }).catch(() => {
      // offline or DB not configured yet — local cache still has it
    });
  }, []);

  const removeIdea = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/ideas?id=${encodeURIComponent(id)}`, { method: "DELETE", keepalive: true }).catch(() => {
      // offline or DB not configured yet — local cache still reflects the removal
    });
  }, []);

  return (
    <IdeasCtx.Provider value={{ ideas, hydrated, addIdea, updateIdea, removeIdea }}>
      {children}
    </IdeasCtx.Provider>
  );
}

export function useIdeas() {
  const ctx = useContext(IdeasCtx);
  if (!ctx) throw new Error("useIdeas must be used within IdeasProvider");
  return ctx;
}
