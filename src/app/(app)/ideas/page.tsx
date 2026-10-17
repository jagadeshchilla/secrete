"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import { useIdeas } from "@/context/IdeasContext";
import { useNewBadge } from "@/hooks/useNewBadge";
import NewBadge from "@/components/NewBadge";
import { PROFILES, PROFILE_LABELS, type Profile } from "@/config/access";
import { IDEA_TASK_TYPES, type IdeaTask, type IdeaDataSource, type ProjectIdea } from "@/types/ideas";
import {
  LightbulbIcon,
  SearchIcon,
  CloseIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
  CheckIcon,
  FlaskIcon,
  DatabaseIcon,
  ChipIcon,
  StackIcon,
  CalendarIcon,
  ShieldIcon,
  ExternalLinkIcon,
} from "@/components/icons";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const inputCls =
  "w-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]";

// ---- Shared label row (view-only — editing is controlled by one button for the whole workflow) ----
function SectionHeader({ icon: Icon, label }: { icon: typeof LightbulbIcon; label: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </p>
  );
}

// ---- Generic add/remove chip list, used for research topics / methods / tech stack ----
function TagListField({
  icon,
  label,
  items,
  placeholder,
  editing,
  onAdd,
  onRemove,
}: {
  icon: typeof LightbulbIcon;
  label: string;
  items: string[];
  placeholder: string;
  editing: boolean;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  }

  return (
    <div>
      <SectionHeader icon={icon} label={label} />
      {items.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="flex items-center gap-1 border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[11px]"
            >
              {item}
              {editing && (
                <button type="button" onClick={() => onRemove(idx)} className="text-[var(--muted)] hover:text-[var(--bad)]">
                  <CloseIcon className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-[var(--muted)]">Nothing added yet.</p>
      )}
      {editing && (
        <div className="mt-1.5 flex gap-1.5">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            autoFocus
            className={inputCls}
          />
          <button
            type="button"
            onClick={submit}
            className="shrink-0 border border-[var(--border)] px-2.5 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Data sources: {label, url} pairs ----
function DataSourceField({
  dataSources,
  editing,
  onAdd,
  onRemove,
}: {
  dataSources: IdeaDataSource[];
  editing: boolean;
  onAdd: (source: IdeaDataSource) => void;
  onRemove: (id: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  function submit() {
    if (!label.trim() || !url.trim()) return;
    onAdd({ id: newId(), label: label.trim(), url: url.trim() });
    setLabel("");
    setUrl("");
  }

  return (
    <div>
      <SectionHeader icon={DatabaseIcon} label="Data needed" />
      {dataSources.length > 0 ? (
        <div className="mt-1.5 space-y-1">
          {dataSources.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-2 border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5">
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
              >
                <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                <span className="truncate">{d.label}</span>
              </a>
              {editing && (
                <button type="button" onClick={() => onRemove(d.id)} className="shrink-0 text-[var(--muted)] hover:text-[var(--bad)]">
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-[var(--muted)]">Nothing added yet.</p>
      )}
      {editing && (
        <div className="mt-1.5 grid grid-cols-[1fr_1fr_auto] gap-1.5">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What data" autoFocus className={inputCls} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link to it" className={inputCls} />
          <button
            type="button"
            onClick={submit}
            className="shrink-0 border border-[var(--border)] px-2.5 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Tasks: title + type + assignee + done ----
function TaskListField({
  tasks,
  editing,
  onAdd,
  onToggle,
  onRemove,
}: {
  tasks: IdeaTask[];
  editing: boolean;
  onAdd: (task: IdeaTask) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<IdeaTask["type"]>("researching");
  const [assignedTo, setAssignedTo] = useState<Profile | "">("");

  function submit() {
    if (!title.trim()) return;
    onAdd({ id: newId(), title: title.trim(), type, assignedTo: assignedTo || undefined, done: false });
    setTitle("");
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionHeader icon={StackIcon} label="Tasks" />
        {tasks.length > 0 && (
          <span className="text-[11px] text-[var(--muted)]">
            {doneCount}/{tasks.length} done
          </span>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="mt-1.5 space-y-1.5">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => onToggle(t.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  t.done ? "border-[var(--good)] bg-[var(--good)] text-white" : "border-[var(--border)]"
                }`}
              >
                {t.done && <CheckIcon className="h-3 w-3" />}
              </button>
              <span className={`min-w-0 flex-1 truncate text-xs ${t.done ? "text-[var(--muted)] line-through" : ""}`}>
                {t.title}
              </span>
              <span className="shrink-0 border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                {IDEA_TASK_TYPES.find((x) => x.value === t.type)?.label}
              </span>
              {t.assignedTo && (
                <span className="shrink-0 border border-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] text-[var(--accent)]">
                  {PROFILE_LABELS[t.assignedTo]}
                </span>
              )}
              {editing && (
                <button type="button" onClick={() => onRemove(t.id)} className="shrink-0 text-[var(--muted)] hover:text-[var(--bad)]">
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-[var(--muted)]">No tasks added yet.</p>
      )}

      {editing && (
        <div className="mt-1.5 grid grid-cols-[1fr_auto_auto_auto] gap-1.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task — e.g. Research X"
            autoFocus
            className={inputCls}
          />
          <select value={type} onChange={(e) => setType(e.target.value as IdeaTask["type"])} className={inputCls}>
            {IDEA_TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value as Profile | "")} className={inputCls}>
            <option value="">Unassigned</option>
            {PROFILES.map((p) => (
              <option key={p} value={p}>
                {PROFILE_LABELS[p]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submit}
            className="shrink-0 border border-[var(--border)] px-2.5 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---- First decision shown on a newly-added idea: can we actually do this? ----
function FeasibilityGate({ onDecide }: { onDecide: (feasible: boolean, reason?: string) => void }) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const [reason, setReason] = useState("");

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      <p className="mb-1.5 text-xs font-medium text-[var(--muted)]">Can we actually do this?</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setChoice(true)}
          className={`flex-1 border px-3 py-2 text-xs font-medium ${
            choice === true
              ? "border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]"
              : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
          }`}
        >
          Yes — let&apos;s do it
        </button>
        <button
          type="button"
          onClick={() => setChoice(false)}
          className={`flex-1 border px-3 py-2 text-xs font-medium ${
            choice === false
              ? "border-[var(--bad)] bg-[rgba(224,122,95,0.12)] text-[var(--bad)]"
              : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
          }`}
        >
          No, not right now
        </button>
      </div>

      {choice === false && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="Why not? (required)"
          className="mt-2 w-full border border-[var(--border)] bg-[var(--surface-2)] p-2.5 text-xs outline-none focus:border-[var(--accent)]"
        />
      )}

      <button
        type="button"
        disabled={choice === null || (choice === false && !reason.trim())}
        onClick={() => onDecide(choice as boolean, choice === false ? reason.trim() : undefined)}
        className="btn-shimmer mt-3 w-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
      >
        Confirm
      </button>
    </div>
  );
}

// ---- Full workflow shown inside an expanded, feasible idea ----
function IdeaWorkflow({ idea, onMarkInfeasible }: { idea: ProjectIdea; onMarkInfeasible: (reason: string) => void }) {
  const { updateIdea } = useIdeas();
  const [editing, setEditing] = useState(false);
  const [targetDate, setTargetDate] = useState(idea.targetDate || "");
  const [blockers, setBlockers] = useState(idea.blockers || "");
  const [outcomeNotes, setOutcomeNotes] = useState(idea.outcomeNotes || "");
  const [researchPaperLink, setResearchPaperLink] = useState(idea.researchPaperLink || "");
  const [showNotPursuing, setShowNotPursuing] = useState(false);
  const [notPursuingReason, setNotPursuingReason] = useState("");

  return (
    <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Workflow</p>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className={`border px-2.5 py-1 text-[11px] font-medium ${
            editing
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          }`}
        >
          {editing ? "Done editing" : "Edit"}
        </button>
      </div>

      <TagListField
        icon={FlaskIcon}
        label="What to research"
        items={idea.researchTopics}
        placeholder="A question or topic to look into"
        editing={editing}
        onAdd={(v) => updateIdea(idea.id, { researchTopics: [...idea.researchTopics, v] })}
        onRemove={(i) => updateIdea(idea.id, { researchTopics: idea.researchTopics.filter((_, idx) => idx !== i) })}
      />

      <DataSourceField
        dataSources={idea.dataSources}
        editing={editing}
        onAdd={(d) => updateIdea(idea.id, { dataSources: [...idea.dataSources, d] })}
        onRemove={(id) => updateIdea(idea.id, { dataSources: idea.dataSources.filter((d) => d.id !== id) })}
      />

      <TagListField
        icon={ChipIcon}
        label="Methods & concepts"
        items={idea.methods}
        placeholder="e.g. Random forest, A/B testing"
        editing={editing}
        onAdd={(v) => updateIdea(idea.id, { methods: [...idea.methods, v] })}
        onRemove={(i) => updateIdea(idea.id, { methods: idea.methods.filter((_, idx) => idx !== i) })}
      />

      <TagListField
        icon={StackIcon}
        label="Tech stack"
        items={idea.techStack}
        placeholder="e.g. Python, PostgreSQL"
        editing={editing}
        onAdd={(v) => updateIdea(idea.id, { techStack: [...idea.techStack, v] })}
        onRemove={(i) => updateIdea(idea.id, { techStack: idea.techStack.filter((_, idx) => idx !== i) })}
      />

      <TaskListField
        tasks={idea.tasks}
        editing={editing}
        onAdd={(t) => updateIdea(idea.id, { tasks: [...idea.tasks, t] })}
        onToggle={(id) =>
          updateIdea(idea.id, { tasks: idea.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })
        }
        onRemove={(id) => updateIdea(idea.id, { tasks: idea.tasks.filter((t) => t.id !== id) })}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            <CalendarIcon className="h-3.5 w-3.5" />
            Target date / estimate
          </p>
          {editing ? (
            <input
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              onBlur={() => updateIdea(idea.id, { targetDate: targetDate.trim() || undefined })}
              placeholder="e.g. 2 weeks, or a date"
              className={`${inputCls} mt-1.5`}
            />
          ) : (
            <p className="mt-1 text-xs text-[var(--muted)]">{idea.targetDate || "Not set."}</p>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            <ExternalLinkIcon className="h-3.5 w-3.5" />
            Research paper link
          </p>
          {editing ? (
            <input
              value={researchPaperLink}
              onChange={(e) => setResearchPaperLink(e.target.value)}
              onBlur={() => updateIdea(idea.id, { researchPaperLink: researchPaperLink.trim() || undefined })}
              placeholder="If this became a paper..."
              className={`${inputCls} mt-1.5`}
            />
          ) : idea.researchPaperLink ? (
            <a
              href={idea.researchPaperLink}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              <ExternalLinkIcon className="h-3 w-3" />
              {idea.researchPaperLink}
            </a>
          ) : (
            <p className="mt-1 text-xs text-[var(--muted)]">Not set.</p>
          )}
        </div>
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          <ShieldIcon className="h-3.5 w-3.5" />
          Blockers / risks
        </p>
        {editing ? (
          <textarea
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            onBlur={() => updateIdea(idea.id, { blockers: blockers.trim() || undefined })}
            rows={2}
            placeholder="Anything this depends on, or you're unsure is possible"
            className={`${inputCls} mt-1.5`}
          />
        ) : (
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{idea.blockers || "None noted."}</p>
        )}
      </div>

      <div className="border-t border-[var(--border)] pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">Final status</p>
          <button
            type="button"
            onClick={() => updateIdea(idea.id, { done: !idea.done })}
            className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium ${
              idea.done
                ? "border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            {idea.done && <CheckIcon className="h-3.5 w-3.5" />}
            {idea.done ? "Done" : "Mark as done"}
          </button>
        </div>
        {idea.done && (
          editing ? (
            <textarea
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              onBlur={() => updateIdea(idea.id, { outcomeNotes: outcomeNotes.trim() || undefined })}
              rows={2}
              placeholder="What did you actually build or learn?"
              className={`${inputCls} mt-2`}
            />
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              {idea.outcomeNotes || "No notes yet."}
            </p>
          )
        )}

        {!idea.done && (
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            {showNotPursuing ? (
              <div className="space-y-1.5">
                <textarea
                  value={notPursuingReason}
                  onChange={(e) => setNotPursuingReason(e.target.value)}
                  rows={2}
                  placeholder="Why stop pursuing this? (required)"
                  className={inputCls}
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={!notPursuingReason.trim()}
                    onClick={() => onMarkInfeasible(notPursuingReason.trim())}
                    className="border border-[var(--bad)] px-2.5 py-1 text-[11px] font-medium text-[var(--bad)] disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNotPursuing(false)}
                    className="border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNotPursuing(true)}
                className="text-[11px] font-medium text-[var(--muted)] hover:text-[var(--bad)]"
              >
                Not pursuing this after all?
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function IdeasPage() {
  const { data, domains } = useAppState();
  const { profile } = useAccess();
  const { ideas, addIdea, updateIdea, removeIdea } = useIdeas();

  const [view, setView] = useState<"all" | "mine">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
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
          <div className="mt-3 divide-y divide-[var(--border)] border border-[var(--border)]">
            {visibleIdeas.map((idea, i) => {
              const isOpen = expanded.has(idea.id);
              const doneTasks = idea.tasks.filter((t) => t.done).length;
              return (
                <div key={idea.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                  <button
                    onClick={() => toggleExpanded(idea.id)}
                    className="flex w-full items-center justify-between gap-3 bg-[var(--surface)] px-4 py-3 text-left hover:bg-[var(--surface-2)]"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="min-w-0 truncate text-sm font-medium">{idea.title}</span>
                      {isNewIdea(idea.createdAt) && <NewBadge />}
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
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-[11px] text-[var(--muted)]">
                      {PROFILE_LABELS[idea.createdBy]} · {new Date(idea.createdAt).toLocaleDateString()}
                      <ChevronDownIcon
                        className={`h-4 w-4 text-[var(--muted)] transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="animate-fade-in-up bg-[var(--surface-2)] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm leading-relaxed text-[var(--muted)]">{idea.description}</p>
                        <button
                          onClick={() => removeIdea(idea.id)}
                          className="shrink-0 p-1 text-[var(--muted)] hover:text-[var(--bad)]"
                          title="Delete idea"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {idea.domains.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {idea.domains.map((d) => (
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
                        {idea.roleKeys.map((key) => {
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
                      <div className="mt-3 text-[11px] text-[var(--muted)]">
                        Added by <strong className="text-[var(--text)]">{PROFILE_LABELS[idea.createdBy]}</strong>
                      </div>

                      {idea.feasible === null ? (
                        <FeasibilityGate
                          onDecide={(feasible, reason) => updateIdea(idea.id, { feasible, infeasibleReason: reason })}
                        />
                      ) : idea.feasible === false ? (
                        <div className="mt-4 border border-[var(--border)] bg-[var(--surface)] p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-[var(--muted)]">Not pursuing this idea</p>
                              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{idea.infeasibleReason}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateIdea(idea.id, { feasible: true, infeasibleReason: undefined })}
                              className="shrink-0 border border-[var(--border)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            >
                              Reconsider
                            </button>
                          </div>
                        </div>
                      ) : (
                        <IdeaWorkflow idea={idea} onMarkInfeasible={(reason) => updateIdea(idea.id, { feasible: false, infeasibleReason: reason })} />
                      )}
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
