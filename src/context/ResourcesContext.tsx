"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { LearningResource, ResourceState, ResourceType } from "@/types/resources";

const STORAGE_KEY = "careerLearningResources";

interface ResourcesState {
  resources: ResourceState;
  hydrated: boolean;
  getResources: (key: string) => LearningResource[];
  addResource: (key: string, input: { title: string; url: string; type: ResourceType }) => void;
  removeResource: (key: string, id: string) => void;
}

const ResourcesCtx = createContext<ResourcesState | null>(null);

export function ResourcesProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<ResourceState>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setResources(JSON.parse(stored));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);

    fetch("/api/resources")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.resources) setResources(json.resources);
      })
      .catch(() => {
        // offline or DB not configured yet — keep the local cache
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    } catch {
      // ignore write failures
    }
  }, [resources, hydrated]);

  const getResources = useCallback((key: string) => resources[key] || [], [resources]);

  const addResource = useCallback(
    (key: string, input: { title: string; url: string; type: ResourceType }) => {
      const entry: LearningResource = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: input.title,
        url: input.url,
        type: input.type,
        addedAt: new Date().toISOString(),
      };
      setResources((prev) => ({ ...prev, [key]: [...(prev[key] || []), entry] }));
      fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleKey: key, ...input }),
        keepalive: true,
      }).catch(() => {
        // offline or DB not configured yet — local cache still has it
      });
    },
    []
  );

  const removeResource = useCallback((key: string, id: string) => {
    setResources((prev) => ({ ...prev, [key]: (prev[key] || []).filter((r) => r.id !== id) }));
    fetch(`/api/resources?id=${encodeURIComponent(id)}`, { method: "DELETE", keepalive: true }).catch(() => {
      // offline or DB not configured yet — local cache still reflects the removal
    });
  }, []);

  return (
    <ResourcesCtx.Provider value={{ resources, hydrated, getResources, addResource, removeResource }}>
      {children}
    </ResourcesCtx.Provider>
  );
}

export function useResources() {
  const ctx = useContext(ResourcesCtx);
  if (!ctx) throw new Error("useResources must be used within ResourcesProvider");
  return ctx;
}
