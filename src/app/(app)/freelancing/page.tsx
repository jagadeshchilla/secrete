"use client";

import { useMemo, useState } from "react";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import { useFreelance } from "@/context/FreelanceContext";
import { PROFILE_LABELS } from "@/config/access";
import { FREELANCE_STATUSES, type FreelanceStatus } from "@/types/freelance";
import {
  BriefcaseIcon,
  SearchIcon,
  CloseIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
} from "@/components/icons";

const STATUS_STYLES: Record<FreelanceStatus, string> = {
  open: "border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]",
  applied: "border-[#f2c368] bg-[rgba(242,195,104,0.12)] text-[#c9972e]",
  "in-progress": "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]",
  completed: "border-[var(--border)] text-[var(--muted)]",
};

export default function FreelancingPage() {
  const { data, domains } = useAppState();
  const { profile } = useAccess();
  const { gigs, addGig, setStatus, removeGig } = useFreelance();

  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [budget, setBudget] = useState("");
  const [formStatus, setFormStatus] = useState<FreelanceStatus>("open");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const roleFilterResults = useMemo(() => {
    const q = roleSearch.toLowerCase().trim();
    if (!q) return [];
    return data
      .filter((r) => !selectedKeys.includes(keyFor(r)))
      .filter((r) => `${r.role} ${r.domain}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [data, roleSearch, selectedKeys]);

  const roleByKey = useMemo(() => {
    const map = new Map<string, (typeof data)[number]>();
    data.forEach((r) => map.set(keyFor(r), r));
    return map;
  }, [data]);

  function toggleRole(key: string) {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setRoleSearch("");
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) => (prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]));
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setLink("");
    setBudget("");
    setFormStatus("open");
    setSelectedDomains([]);
    setSelectedKeys([]);
    setRoleSearch("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !title.trim() || !description.trim() || selectedKeys.length === 0) return;
    addGig({
      title: title.trim(),
      description: description.trim(),
      status: formStatus,
      link: link.trim() || undefined,
      budget: budget.trim() || undefined,
      domains: selectedDomains,
      roleKeys: selectedKeys,
      createdBy: profile,
    });
    resetForm();
    setModalOpen(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="text-2xl font-semibold tracking-tight">Freelancing</h1>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Found a freelance gig worth looking into? Share it here — tag which roles it fits, the rate,
            and a link, and track it from open to completed.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-shimmer inline-flex shrink-0 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          <PlusIcon className="h-4 w-4" />
          Add gig
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-[var(--muted)]">
          {gigs.length} {gigs.length === 1 ? "gig" : "gigs"}
        </h2>

        {gigs.length === 0 ? (
          <div className="mt-3 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
            No gigs yet. Click &ldquo;Add gig&rdquo; to add the first one.
          </div>
        ) : (
          <div className="mt-3 divide-y divide-[var(--border)] border border-[var(--border)]">
            {gigs.map((gig, i) => {
              const isOpen = expanded.has(gig.id);
              return (
                <div key={gig.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                  <button
                    onClick={() => toggleExpanded(gig.id)}
                    className="flex w-full items-center justify-between gap-3 bg-[var(--surface)] px-4 py-3 text-left hover:bg-[var(--surface-2)]"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="min-w-0 truncate text-sm font-medium">{gig.title}</span>
                      <span
                        className={`shrink-0 border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[gig.status]}`}
                      >
                        {FREELANCE_STATUSES.find((s) => s.value === gig.status)?.label}
                      </span>
                      {gig.budget && (
                        <span className="shrink-0 border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                          {gig.budget}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[11px] text-[var(--muted)]">
                      {PROFILE_LABELS[gig.createdBy]} · {new Date(gig.createdAt).toLocaleDateString()}
                      <ChevronDownIcon
                        className={`h-4 w-4 text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="animate-fade-in-up bg-[var(--surface-2)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm leading-relaxed text-[var(--muted)]">{gig.description}</p>
                        <button
                          onClick={() => removeGig(gig.id)}
                          className="shrink-0 p-1 text-[var(--muted)] hover:text-[var(--bad)]"
                          title="Delete gig"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {gig.link && (
                        <a
                          href={gig.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
                        >
                          <ExternalLinkIcon className="h-3.5 w-3.5" />
                          Open listing
                        </a>
                      )}

                      {gig.domains.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {gig.domains.map((d) => (
                            <span
                              key={d}
                              className="border border-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]"
                            >
                              {stripEmoji(d)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {gig.roleKeys.map((key) => {
                          const r = roleByKey.get(key);
                          if (!r) return null;
                          return (
                            <span
                              key={key}
                              className="border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
                            >
                              {r.role}
                            </span>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-[var(--muted)]">
                          Added by{" "}
                          <strong className="text-[var(--text)]">{PROFILE_LABELS[gig.createdBy]}</strong>
                        </span>
                        <select
                          value={gig.status}
                          onChange={(e) => setStatus(gig.id, e.target.value as FreelanceStatus)}
                          className="border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
                        >
                          {FREELANCE_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:items-center">
          <div className="animate-scale-in w-full max-w-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <h2 className="text-sm font-semibold">Add a freelance gig</h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build a data pipeline dashboard for a startup"
                  autoFocus
                  className="w-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="What's the gig, what's expected, and why is it worth pursuing?"
                  className="w-full border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as FreelanceStatus)}
                    className="w-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
                  >
                    {FREELANCE_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                    Budget <span className="text-[var(--muted)]">(optional)</span>
                  </label>
                  <input
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. $40/hr or $1,200 fixed"
                    className="w-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                  Listing link <span className="text-[var(--muted)]">(optional)</span>
                </label>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                  Domains <span className="text-[var(--muted)]">(optional, select one or more)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {domains.map((d) => {
                    const active = selectedDomains.includes(d);
                    return (
                      <button
                        type="button"
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
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-medium text-[var(--muted)]">
                  Related roles <span className="text-[var(--muted)]">(select one or more)</span>
                </label>

                {selectedKeys.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedKeys.map((key) => {
                      const r = roleByKey.get(key);
                      if (!r) return null;
                      return (
                        <span
                          key={key}
                          className="flex items-center gap-1 border border-[var(--accent)] bg-[var(--accent-soft)] px-2 py-1 text-[11px] font-medium text-[var(--accent)]"
                        >
                          {r.role}
                          <button
                            type="button"
                            onClick={() => toggleRole(key)}
                            className="text-[var(--accent)] hover:text-[var(--bad)]"
                          >
                            <CloseIcon className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Search roles to tag..."
                    autoComplete="off"
                    className="w-full border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-8 pr-3 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </div>
                {roleFilterResults.length > 0 && (
                  <div className="mt-1 divide-y divide-[var(--border)] border border-[var(--border)]">
                    {roleFilterResults.map((r) => (
                      <button
                        type="button"
                        key={keyFor(r)}
                        onClick={() => toggleRole(keyFor(r))}
                        className="flex w-full items-center justify-between gap-2 bg-[var(--surface)] px-3 py-2 text-left text-sm hover:bg-[var(--surface-2)]"
                      >
                        <span className="truncate">{r.role}</span>
                        <span className="shrink-0 text-[11px] text-[var(--muted)]">{stripEmoji(r.domain)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!title.trim() || !description.trim() || selectedKeys.length === 0}
                className="btn-shimmer mt-4 inline-flex w-full items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" />
                Add gig
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
