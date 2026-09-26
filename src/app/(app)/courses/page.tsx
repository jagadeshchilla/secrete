"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ROADMAP_DATA } from "@/data/roadmapData";
import { GraduationCapIcon, SearchIcon, ChevronDownIcon } from "@/components/icons";

interface ToolEntry {
  tool: string;
  count: number;
  roles: { domain: string; role: string }[];
}

function buildToolCatalog(): ToolEntry[] {
  const map = new Map<string, ToolEntry>();
  Object.entries(ROADMAP_DATA).forEach(([key, entry]) => {
    const [domain, role] = key.split("||");
    entry.skills.forEach((stage) => {
      stage.items.forEach((item) => {
        if (!map.has(item)) map.set(item, { tool: item, count: 0, roles: [] });
        const rec = map.get(item)!;
        rec.count += 1;
        rec.roles.push({ domain, role });
      });
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count || a.tool.localeCompare(b.tool));
}

const CATALOG = buildToolCatalog();

function CoursesPageInner() {
  const searchParams = useSearchParams();
  const toolParam = searchParams.get("tool");
  const [search, setSearch] = useState(toolParam || "");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(toolParam ? [toolParam] : []));

  const hasQuery = search.trim().length > 0;
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return CATALOG.filter((t) => t.tool.toLowerCase().includes(q));
  }, [search]);

  function toggle(tool: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool);
      else next.add(tool);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <GraduationCapIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Every language, framework, and platform pulled straight from the Roadmap data —{" "}
        <strong className="text-[var(--text)]">{CATALOG.length}</strong> unique tools across{" "}
        {Object.keys(ROADMAP_DATA).length} roles. Actual course links per tool are still coming soon;
        for now, see how in-demand each one is and which roles need it.
      </p>

      <div className="relative mt-5">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools, languages, platforms..."
          name="courses-tool-search-field"
          autoComplete="off"
          spellCheck={false}
          className="w-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--accent)]"
        />
      </div>

      {!hasQuery ? (
        <div className="mt-8 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
          Start typing to search {CATALOG.length} tools.
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
          No tools match &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[var(--border)] border border-[var(--border)]">
          {filtered.map((t, i) => {
            const isOpen = expanded.has(t.tool);
            return (
              <div key={t.tool} className={i === 0 ? "" : ""}>
                <button
                  onClick={() => toggle(t.tool)}
                  className="flex w-full items-center justify-between gap-3 bg-[var(--surface)] px-4 py-3 text-left hover:bg-[var(--surface-2)]"
                >
                  <span className="min-w-0 truncate text-sm font-medium">{t.tool}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
                      {t.count} {t.count === 1 ? "role" : "roles"}
                    </span>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </span>
                </button>
                {isOpen && (
                  <div className="animate-fade-in-up flex flex-col items-center gap-1.5 bg-[var(--surface-2)] px-4 py-6 text-center">
                    <GraduationCapIcon className="h-5 w-5 text-[var(--muted)]" />
                    <p className="text-sm text-[var(--muted)]">
                      Courses for <strong className="text-[var(--text)]">{t.tool}</strong> coming soon.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <CoursesPageInner />
    </Suspense>
  );
}
