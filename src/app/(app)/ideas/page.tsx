"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import { useIdeas } from "@/context/IdeasContext";
import { useNewBadge } from "@/hooks/useNewBadge";
import NewBadge from "@/components/NewBadge";
import { PROFILE_LABELS } from "@/config/access";
import { LightbulbIcon, SearchIcon, CloseIcon, PlusIcon, ChevronRightIcon } from "@/components/icons";

export default function IdeasPage() {
  const { data, domains } = useAppState();
  const { profile } = useAccess();
  const { ideas, addIdea } = useIdeas();

  const [view, setView] = useState<"all" | "mine">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [roleSearch, setRoleSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const visibleIdeas = useMemo(
    () => (view === "mine" ? ideas.filter((i) => i.createdBy === profile) : ideas),
    [ideas, view, profile]
  );

  const { isNew: isNewIdea, markSeen: markIdeasSeen } = useNewBadge(
    "ideas",
    ideas.map((i) => i.createdAt)
  );

  useEffect(() => {
    markIdeasSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas]);

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

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) => (prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]));
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setSelectedDomains([]);
    setSelectedKeys([]);
    setRoleSearch("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !title.trim() || !description.trim()) return;
    addIdea({
      title: title.trim(),
      description: description.trim(),
      domains: selectedDomains,
      roleKeys: selectedKeys,
      createdBy: profile,
    });
    resetForm();
    setModalOpen(false);
  }

  const canSubmit = !!title.trim() && !!description.trim();

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="text-2xl font-semibold tracking-tight">Project Ideas</h1>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Got an idea for a project that could apply to one or more roles? Add it here — both of you can
            see and build on each other&apos;s ideas.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-shimmer inline-flex shrink-0 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
        >
          <PlusIcon className="h-4 w-4" />
          Add idea
        </button>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--muted)]">
            {visibleIdeas.length} {visibleIdeas.length === 1 ? "idea" : "ideas"}
          </h2>
          <div className="flex border border-[var(--border)]">
            <button
              onClick={() => setView("all")}
              className={`px-3 py-1.5 text-xs font-medium ${
                view === "all" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              All ideas
            </button>
            <button
              onClick={() => setView("mine")}
              className={`border-l border-[var(--border)] px-3 py-1.5 text-xs font-medium ${
                view === "mine" ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              My ideas
            </button>
          </div>
        </div>

        {visibleIdeas.length === 0 ? (
          <div className="mt-3 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
            {view === "mine" ? "You haven't added any ideas yet." : "No ideas yet. Click “Add idea” to add the first one."}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibleIdeas.map((idea, i) => {
              const doneTasks = idea.tasks.filter((t) => t.done).length;
              return (
                <Link
                  key={idea.id}
                  href={`/ideas/${idea.id}`}
                  className="card-hover animate-fade-in-up flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]"
                  style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--good)] text-white">
                      <LightbulbIcon className="h-4.5 w-4.5" />
                    </div>
                    {isNewIdea(idea.createdAt) && <NewBadge />}
                  </div>

                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{idea.title}</h3>

                  <div className="flex flex-wrap gap-1.5">
                    {idea.feasible === null && (
                      <span className="shrink-0 border border-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] text-[var(--accent)]">
                        Decide feasibility
                      </span>
                    )}
                    {idea.feasible === false && (
                      <span className="shrink-0 border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                        Not pursuing
                      </span>
                    )}
                    {idea.feasible && idea.done && (
                      <span className="shrink-0 border border-[var(--good)] bg-[var(--good-soft)] px-1.5 py-0.5 text-[10px] text-[var(--good)]">
                        Done
                      </span>
                    )}
                    {idea.feasible && !idea.done && idea.tasks.length > 0 && (
                      <span className="shrink-0 border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                        {doneTasks}/{idea.tasks.length} tasks
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-1 text-[11px] text-[var(--muted)]">
                    <span>
                      {PROFILE_LABELS[idea.createdBy]} · {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                    <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8 sm:items-center">
          <div className="animate-scale-in w-full max-w-lg border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <h2 className="text-sm font-semibold">Add a new idea</h2>
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
                  placeholder="e.g. Real-time fraud detection dashboard"
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
                  placeholder="What is this project, why is it useful, and how would you approach it?"
                  className="w-full border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm outline-none focus:border-[var(--accent)]"
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
                  Related roles <span className="text-[var(--muted)]">(optional, select one or more)</span>
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

              <p className="mt-3 text-[11px] text-[var(--muted)]">
                Once added, open the idea to decide if it&apos;s feasible and build out the rest — research,
                data, methods, tasks, and status.
              </p>

              <button
                type="submit"
                disabled={!canSubmit}
                className="btn-shimmer mt-4 inline-flex w-full items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" />
                Add idea
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
