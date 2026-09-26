"use client";

import { useMemo, useState } from "react";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import type { CareerRole } from "@/types/career";
import RoleCard from "@/components/RoleCard";
import RoleDrawer from "@/components/RoleDrawer";
import { SearchIcon } from "@/components/icons";

const CODING_LEVELS = ["Low", "Low-Medium", "Medium", "Medium-High", "High", "Very High"];

export default function RolesPage() {
  const { data, domains, getRecord, setStatus, setNote } = useAppState();
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [codingFilter, setCodingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [active, setActive] = useState<CareerRole | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return data.filter((x) => {
      const r = getRecord(x);
      if (q && !`${x.role} ${x.domain} ${x.description} ${x.ai}`.toLowerCase().includes(q)) return false;
      if (domainFilter && x.domain !== domainFilter) return false;
      if (codingFilter && x.coding !== codingFilter) return false;
      if (statusFilter === "researched" && !r.researched) return false;
      if (statusFilter === "interested" && !r.interested) return false;
      if (statusFilter === "completed" && !r.completed) return false;
      if (statusFilter === "none" && (r.researched || r.interested || r.completed)) return false;
      return true;
    });
  }, [data, getRecord, search, domainFilter, codingFilter, statusFilter]);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-5 py-8 md:px-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-6 space-y-5">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Domain
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setDomainFilter("")}
                className={`block w-full border-l-2 px-2 py-1.5 text-left text-sm ${
                  domainFilter === ""
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                All domains
              </button>
              {domains.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomainFilter(d)}
                  className={`block w-full border-l-2 px-2 py-1.5 text-left text-sm ${
                    domainFilter === d
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {stripEmoji(d)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Coding level
            </div>
            <select
              value={codingFilter}
              onChange={(e) => setCodingFilter(e.target.value)}
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
            >
              <option value="">All levels</option>
              {CODING_LEVELS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Status
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
            >
              <option value="">All progress</option>
              <option value="researched">Researched</option>
              <option value="interested">Interested</option>
              <option value="completed">Completed</option>
              <option value="none">Not started</option>
            </select>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="animate-fade-in-up flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Explore Roles</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {filtered.length} of {data.length} roles
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              name="roles-search-field"
              autoComplete="off"
              spellCheck={false}
              className="w-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Mobile filters */}
        <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="shrink-0 border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
          >
            <option value="">All domains</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {stripEmoji(d)}
              </option>
            ))}
          </select>
          <select
            value={codingFilter}
            onChange={(e) => setCodingFilter(e.target.value)}
            className="shrink-0 border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
          >
            <option value="">All levels</option>
            {CODING_LEVELS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="shrink-0 border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
          >
            <option value="">All progress</option>
            <option value="researched">Researched</option>
            <option value="interested">Interested</option>
            <option value="completed">Completed</option>
            <option value="none">Not started</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
            No roles match your filters.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((role, i) => (
              <RoleCard
                key={keyFor(role)}
                role={role}
                record={getRecord(role)}
                onOpen={() => setActive(role)}
                onStatusChange={(field, value) => setStatus(role, field, value)}
                style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      <RoleDrawer
        role={active}
        record={active ? getRecord(active) : {}}
        onClose={() => setActive(null)}
        onStatusChange={(field, value) => active && setStatus(active, field, value)}
        onNoteChange={(value) => active && setNote(active, value)}
      />
    </div>
  );
}
