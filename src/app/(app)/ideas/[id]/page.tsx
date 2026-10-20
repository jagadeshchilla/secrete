"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import { useIdeas } from "@/context/IdeasContext";
import { PROFILES, PROFILE_LABELS, type Profile } from "@/config/access";
import { IDEA_TASK_TYPES, type IdeaTask, type IdeaDataSource, type ProjectIdea } from "@/types/ideas";
import {
  LightbulbIcon,
  ArrowLeftIcon,
  CloseIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  FlaskIcon,
  DatabaseIcon,
  ChipIcon,
  StackIcon,
  CalendarIcon,
  ShieldIcon,
  ExternalLinkIcon,
  PencilIcon,
} from "@/components/icons";

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const inputCls =
  "w-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]";

// ---- Idea title + description, editable in place ----
function IdeaMetaField({
  title,
  description,
  onSave,
}: {
  title: string;
  description: string;
  onSave: (next: { title: string; description: string }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDescription, setDraftDescription] = useState(description);

  function startEdit() {
    setDraftTitle(title);
    setDraftDescription(description);
    setEditing(true);
  }

  function save() {
    if (!draftTitle.trim() || !draftDescription.trim()) return;
    onSave({ title: draftTitle.trim(), description: draftDescription.trim() });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex-1">
        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          autoFocus
          className="w-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-medium outline-none focus:border-[var(--accent)]"
        />
        <textarea
          value={draftDescription}
          onChange={(e) => setDraftDescription(e.target.value)}
          rows={3}
          className="mt-2 w-full border border-[var(--border)] bg-[var(--surface)] p-2.5 text-sm leading-relaxed outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!draftTitle.trim() || !draftDescription.trim()}
            className="border border-[var(--accent)] bg-[var(--accent)] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-2">
        <h1 className="min-w-0 text-lg font-semibold">{title}</h1>
        <button type="button" onClick={startEdit} className="shrink-0 text-[var(--muted)] hover:text-[var(--accent)]" title="Edit title & description">
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{description}</p>
    </div>
  );
}

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
  onUpdate,
  onRemove,
}: {
  dataSources: IdeaDataSource[];
  editing: boolean;
  onAdd: (source: IdeaDataSource) => void;
  onUpdate: (source: IdeaDataSource) => void;
  onRemove: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [extract, setExtract] = useState("");
  const [category, setCategory] = useState("");

  function startEdit(d: IdeaDataSource) {
    setEditingId(d.id);
    setLabel(d.label);
    setUrl(d.url);
    setExtract(d.extract || "");
    setCategory(d.category || "");
  }

  function resetForm() {
    setEditingId(null);
    setLabel("");
    setUrl("");
    setExtract("");
    setCategory("");
  }

  function submit() {
    if (!label.trim() || !url.trim()) return;
    const source: IdeaDataSource = {
      id: editingId || newId(),
      label: label.trim(),
      url: url.trim(),
      extract: extract.trim() || undefined,
      category: category.trim() || undefined,
    };
    if (editingId) onUpdate(source);
    else onAdd(source);
    resetForm();
  }

  return (
    <div>
      <SectionHeader icon={DatabaseIcon} label="Data needed" />
      {dataSources.length > 0 ? (
        <div className="mt-1.5 space-y-1">
          {dataSources.map((d) => (
            <div key={d.id} className="flex items-start justify-between gap-2 border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                    <span className="truncate">{d.label}</span>
                  </a>
                  {d.category && (
                    <span className="shrink-0 border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                      {d.category}
                    </span>
                  )}
                </div>
                {d.extract && <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">Extract: {d.extract}</p>}
              </div>
              {editing && (
                <div className="flex shrink-0 items-center gap-2">
                  <button type="button" onClick={() => startEdit(d)} className="text-[var(--muted)] hover:text-[var(--accent)]">
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => onRemove(d.id)} className="text-[var(--muted)] hover:text-[var(--bad)]">
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-[11px] text-[var(--muted)]">Nothing added yet.</p>
      )}
      {editing && (
        <div className="mt-1.5 space-y-1.5">
          {editingId && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium text-[var(--accent)]">Editing entry</p>
              <button type="button" onClick={resetForm} className="text-[10px] text-[var(--muted)] hover:text-[var(--text)]">
                Cancel
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[1fr_1fr_auto]">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What data" autoFocus className={inputCls} />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Link to it" className={inputCls} />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className={inputCls} />
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-1.5">
            <input value={extract} onChange={(e) => setExtract(e.target.value)} placeholder="What we can extract from there" className={inputCls} />
            <button
              type="button"
              onClick={submit}
              className="shrink-0 border border-[var(--border)] px-2.5 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {editingId ? <CheckIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
            </button>
          </div>
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
        <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-[1fr_auto_auto_auto]">
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

// ---- Full workflow shown inside a feasible idea ----
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
        onUpdate={(d) => updateIdea(idea.id, { dataSources: idea.dataSources.map((s) => (s.id === d.id ? d : s)) })}
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

export default function IdeaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data } = useAppState();
  const { ideas, hydrated, updateIdea, removeIdea } = useIdeas();

  const idea = useMemo(() => ideas.find((i) => i.id === params.id), [ideas, params.id]);

  const roleByKey = useMemo(() => {
    const map = new Map<string, (typeof data)[number]>();
    data.forEach((r) => map.set(keyFor(r), r));
    return map;
  }, [data]);

  function handleDelete() {
    if (!idea) return;
    removeIdea(idea.id);
    router.push("/ideas");
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <Link
        href="/ideas"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)]"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to Project Ideas
      </Link>

      {!idea ? (
        hydrated ? (
          <div className="mt-6 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
            Idea not found.
          </div>
        ) : null
      ) : (
        <div className="animate-fade-in-up mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-start justify-between gap-3">
            <IdeaMetaField
              title={idea.title}
              description={idea.description}
              onSave={(next) => updateIdea(idea.id, next)}
            />
            <button
              onClick={handleDelete}
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
            Added by <strong className="text-[var(--text)]">{PROFILE_LABELS[idea.createdBy]}</strong> ·{" "}
            {new Date(idea.createdAt).toLocaleDateString()}
          </div>

          {idea.feasible === null ? (
            <FeasibilityGate
              onDecide={(feasible, reason) => updateIdea(idea.id, { feasible, infeasibleReason: reason })}
            />
          ) : idea.feasible === false ? (
            <div className="surface-card mt-4 p-3">
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
}
