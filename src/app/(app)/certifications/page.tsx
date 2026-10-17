"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import { AwardIcon, SearchIcon, CloseIcon, ExternalLinkIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import Favicon from "@/components/Favicon";
import { CERTIFICATIONS, CERTIFICATION_DOMAINS, LEVEL_TIER_LABELS, type Certification, type LevelTier } from "@/lib/certifications";
import { useNewBadge } from "@/hooks/useNewBadge";
import NewBadge from "@/components/NewBadge";

const CERTIFICATION_TIMESTAMPS = CERTIFICATIONS.map((c) => c.researchedAt);

const PER_PAGE = 18;

const LEVEL_TIER_COLORS: Record<LevelTier, string> = {
  beginner: "var(--good)",
  associate: "var(--accent)",
  professional: "#a78bfa",
  expert: "var(--bad)",
  other: "var(--muted)",
};

const LEVEL_TIERS: LevelTier[] = ["beginner", "associate", "professional", "expert"];

function CertificationCard({ cert, isNew }: { cert: Certification; isNew?: boolean }) {
  const color = LEVEL_TIER_COLORS[cert.levelTier];
  return (
    <a
      href={cert.link}
      target="_blank"
      rel="noreferrer"
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:border-[var(--accent)]"
    >
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
              <Favicon url={cert.link} className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 truncate text-sm font-semibold leading-snug">
                <span className="truncate">{cert.name}</span>
                {isNew && <NewBadge />}
              </h3>
              <p className="truncate text-[10px] text-[var(--muted)]">{cert.issuer}</p>
            </div>
          </div>
          {cert.level && (
            <span
              className="shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold"
              style={{ borderColor: color, color }}
            >
              {cert.level}
            </span>
          )}
        </div>

        {cert.about && <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{cert.about}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--muted)]">
          {cert.price && (
            <span className="rounded-full border border-[var(--border)] px-1.5 py-0.5">{cert.price}</span>
          )}
          {cert.type && <span className="truncate rounded-full border border-[var(--border)] px-1.5 py-0.5">{cert.type}</span>}
        </div>

        {cert.usefulRoles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {cert.usefulRoles.slice(0, 3).map((r) => (
              <span
                key={r}
                className="truncate rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--accent)]"
              >
                {r}
              </span>
            ))}
            {cert.usefulRoles.length > 3 && (
              <span className="rounded-full border border-[var(--border)] px-1.5 py-0.5 text-[9px] text-[var(--muted)]">
                +{cert.usefulRoles.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)]">
          Visit site
          <ExternalLinkIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </a>
  );
}

export default function CertificationsPage() {
  const { data } = useAppState();
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<LevelTier | null>(null);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { isNew: isNewCert, markSeen: markCertificationsSeen } = useNewBadge(
    "certifications",
    CERTIFICATION_TIMESTAMPS
  );

  useEffect(() => {
    markCertificationsSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleFilterResults = useMemo(() => {
    const q = roleSearch.toLowerCase().trim();
    if (!q) return [];
    return data.filter((r) => r.role.toLowerCase().includes(q)).slice(0, 8);
  }, [data, roleSearch]);

  const filtered = useMemo(() => {
    return CERTIFICATIONS.filter((c) => {
      if (selectedDomain && c.domain !== selectedDomain) return false;
      if (selectedRole && !c.usefulRoles.includes(selectedRole)) return false;
      if (selectedLevel && c.levelTier !== selectedLevel) return false;
      if (priceFilter === "free" && !c.isFree) return false;
      if (priceFilter === "paid" && c.isFree) return false;
      return true;
    });
  }, [selectedDomain, selectedRole, selectedLevel, priceFilter]);

  const activeFilterCount = (selectedLevel ? 1 : 0) + (priceFilter !== "all" ? 1 : 0);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function pickRole(role: string) {
    setSelectedRole(role);
    setRoleSearch("");
    setPage(1);
  }

  function clearRole() {
    setSelectedRole(null);
    setPage(1);
  }

  function toggleDomain(domain: string) {
    setSelectedDomain((prev) => (prev === domain ? null : domain));
    setPage(1);
  }

  function toggleLevel(level: LevelTier) {
    setSelectedLevel((prev) => (prev === level ? null : level));
    setPage(1);
  }

  function setPrice(p: "all" | "free" | "paid") {
    setPriceFilter(p);
    setPage(1);
  }

  function clearExtraFilters() {
    setSelectedLevel(null);
    setPriceFilter("all");
    setPage(1);
  }

  function goTo(p: number) {
    setPage(Math.min(Math.max(1, p), pageCount));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <AwardIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Certifications</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {CERTIFICATIONS.length} researched certifications across {CERTIFICATION_DOMAINS.length} domains. Filter by
        domain and/or search a role to see which ones are actually worth pursuing.
      </p>

      <div className="animate-fade-in-up mt-4 flex flex-wrap items-center gap-1.5">
        {CERTIFICATION_DOMAINS.map((d) => {
          const active = selectedDomain === d;
          return (
            <button
              key={d}
              onClick={() => toggleDomain(d)}
              className={`border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              {stripEmoji(d)}
            </button>
          );
        })}
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium transition-colors ${
            filtersOpen || activeFilterCount > 0
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
          }`}
        >
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
      </div>

      {filtersOpen && (
        <div className="animate-fade-in-up mt-2.5 flex flex-wrap items-center gap-4 border border-[var(--border)] bg-[var(--surface)] p-3">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Level</p>
            <div className="flex flex-wrap gap-1.5">
              {LEVEL_TIERS.map((lvl) => {
                const active = selectedLevel === lvl;
                const color = LEVEL_TIER_COLORS[lvl];
                return (
                  <button
                    key={lvl}
                    onClick={() => toggleLevel(lvl)}
                    className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                    style={
                      active
                        ? { borderColor: color, color, background: `${color}1f` }
                        : { borderColor: "var(--border)", color: "var(--muted)" }
                    }
                  >
                    {LEVEL_TIER_LABELS[lvl]}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Price</p>
            <div className="flex gap-1.5">
              {(["all", "free", "paid"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrice(p)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                    priceFilter === p
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearExtraFilters}
              className="ml-auto text-[11px] font-medium text-[var(--muted)] hover:text-[var(--bad)]"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <div className="animate-fade-in-up relative mt-3">
        {selectedRole ? (
          <div className="flex items-center justify-between gap-2 border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2">
            <span className="text-sm font-medium text-[var(--accent)]">
              Showing certs useful for <strong>{selectedRole}</strong>
              {selectedDomain && (
                <>
                  {" "}
                  in <strong>{stripEmoji(selectedDomain)}</strong>
                </>
              )}{" "}
              ({filtered.length})
            </span>
            <button onClick={clearRole} className="shrink-0 text-[var(--accent)] hover:text-[var(--bad)]">
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Search a role (e.g. Data Engineer) to filter certifications..."
              autoComplete="off"
              className="w-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </>
        )}
        {!selectedRole && roleFilterResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 divide-y divide-[var(--border)] border border-[var(--border)] bg-[var(--surface)]">
            {roleFilterResults.map((r) => (
              <button
                key={keyFor(r)}
                onClick={() => pickRole(r.role)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)]"
              >
                <span className="truncate">{r.role}</span>
                <span className="shrink-0 text-[11px] text-[var(--muted)]">{stripEmoji(r.domain)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedRole && (selectedDomain || activeFilterCount > 0) && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          {filtered.length} certification{filtered.length === 1 ? "" : "s"} match
          {selectedDomain && (
            <>
              {" "}
              in <strong className="text-[var(--text)]">{stripEmoji(selectedDomain)}</strong>
            </>
          )}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-6 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
          No certifications match this filter yet.
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <CertificationCard key={c.id} cert={c} isNew={isNewCert(c.researchedAt)} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-1.5">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--muted)]"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 2)
                .map((p, i, arr) => (
                  <span key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-1 text-xs text-[var(--muted)]">…</span>}
                    <button
                      onClick={() => goTo(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                        p === page
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => goTo(page + 1)}
                disabled={page === pageCount}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40 disabled:hover:border-[var(--border)] disabled:hover:text-[var(--muted)]"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
