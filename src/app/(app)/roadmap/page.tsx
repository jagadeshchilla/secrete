"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import { ROADMAP_DATA } from "@/data/roadmapData";
import RoadmapChart from "@/components/RoadmapChart";
import { RouteIcon, ExternalLinkIcon, ArrowLeftIcon } from "@/components/icons";

function RoadmapPageInner() {
  const { data } = useAppState();
  const searchParams = useSearchParams();

  const rolesWithData = useMemo(() => data.filter((r) => ROADMAP_DATA[keyFor(r)]), [data]);
  const domainsWithData = useMemo(
    () => [...new Set(rolesWithData.map((r) => r.domain))],
    [rolesWithData]
  );

  // Deep-link support: /roadmap?domain=...&role=... (used by the "Roadmap" button on role cards)
  const [domain, setDomain] = useState(() => {
    const requested = searchParams.get("domain");
    return requested && domainsWithData.includes(requested) ? requested : domainsWithData[0] || "";
  });
  const rolesInDomain = useMemo(
    () => rolesWithData.filter((r) => r.domain === domain),
    [rolesWithData, domain]
  );
  const [roleKey, setRoleKey] = useState(() => {
    const requestedDomain = searchParams.get("domain");
    const requestedRole = searchParams.get("role");
    if (requestedDomain && requestedRole) {
      const match = rolesWithData.find((r) => r.domain === requestedDomain && r.role === requestedRole);
      if (match) return keyFor(match);
    }
    return rolesInDomain[0] ? keyFor(rolesInDomain[0]) : "";
  });

  // Simple back-stack: every navigation pushes where we came FROM, so "Back"
  // can pop to it — lets you drill into "From Data Engineering" on MLOps
  // Engineer's chart, then return to MLOps Engineer with one click.
  const [history, setHistory] = useState<string[]>([]);

  function navigateTo(newDomain: string, newRoleKey: string) {
    if (newRoleKey === roleKey) return;
    setHistory((prev) => [...prev, roleKey]);
    setDomain(newDomain);
    setRoleKey(newRoleKey);
  }

  function goBack() {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const prevKey = prev[prev.length - 1];
      const role = data.find((r) => keyFor(r) === prevKey);
      if (role) {
        setDomain(role.domain);
        setRoleKey(prevKey);
      }
      return prev.slice(0, -1);
    });
  }

  function handleDomainChange(d: string) {
    const first = rolesWithData.find((r) => r.domain === d);
    navigateTo(d, first ? keyFor(first) : "");
  }

  function handleRoleChange(newRoleKey: string) {
    navigateTo(domain, newRoleKey);
  }

  const selectedRole = data.find((r) => keyFor(r) === roleKey);
  const entry = selectedRole ? ROADMAP_DATA[keyFor(selectedRole)] : undefined;

  function resolveLabel(key: string) {
    const role = data.find((r) => keyFor(r) === key);
    if (!role) return null;
    return { label: role.role, hasData: !!ROADMAP_DATA[key] };
  }

  function openRelated(key: string) {
    const role = data.find((r) => keyFor(r) === key);
    if (!role) return;
    navigateTo(role.domain, key);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <RouteIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Roadmap</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        How roles connect to each other, and what to actually learn for each — languages, tools,
        platforms, and clouds. Researched from current sources, so only roles with real data show up here.
      </p>

      {rolesWithData.length === 0 ? (
        <div className="mt-8 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
          No roadmap data yet.
        </div>
      ) : (
        <>
          {history.length > 0 && (
            <button
              onClick={goBack}
              className="animate-fade-in-up mt-5 flex items-center gap-1.5 border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={domain}
              onChange={(e) => handleDomainChange(e.target.value)}
              className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              {domainsWithData.map((d) => (
                <option key={d} value={d}>
                  {stripEmoji(d)}
                </option>
              ))}
            </select>
            <select
              value={roleKey}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              {rolesInDomain.map((r) => (
                <option key={keyFor(r)} value={keyFor(r)}>
                  {r.role}
                </option>
              ))}
            </select>
          </div>

          {selectedRole && entry && (
            <>
              <div className="mt-5">
                <RoadmapChart
                  roleName={selectedRole.role}
                  entry={entry}
                  resolveLabel={resolveLabel}
                  onOpenRelated={openRelated}
                />
              </div>

              <div className="mt-4 border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="text-xs font-medium text-[var(--muted)]">Sources</div>
                <ul className="mt-2 space-y-1">
                  {entry.sources.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
                      >
                        <ExternalLinkIcon className="h-3 w-3" />
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <RoadmapPageInner />
    </Suspense>
  );
}
