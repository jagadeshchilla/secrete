"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState, stripEmoji, keyFor } from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import type { Course, CourseItem, CourseSection, CourseSubstep, CourseTrack, ResourceType } from "@/types/course";
import { PlusIcon, TrashIcon, CloseIcon, SearchIcon, ChevronDownIcon, ChevronRightIcon } from "@/components/icons";
import { TOOL_CATALOG } from "@/lib/toolCatalog";

const TRACKS: { value: CourseTrack; label: string }[] = [
  { value: "core", label: "Foundations" },
  { value: "backend", label: "Backend" },
  { value: "data", label: "Data" },
  { value: "ai", label: "AI/ML" },
  { value: "infra", label: "Infra" },
];

const PRIORITIES: { value: 5 | 4 | 0; label: string }[] = [
  { value: 5, label: "Critical" },
  { value: 4, label: "High" },
  { value: 0, label: "Later" },
];

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "article", label: "Article" },
  { value: "docs", label: "Docs" },
  { value: "course", label: "Course" },
  { value: "other", label: "Other" },
];

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function emptySubstep(): CourseSubstep {
  return { id: newId(), label: "", whatYouLearn: "", resourceType: "article", resourceUrl: "", prompt: "" };
}

function emptyItem(): CourseItem {
  return { id: newId(), title: "", wholePrompt: "", substeps: [] };
}

function emptySection(): CourseSection {
  return { id: newId(), title: "", note: "", priority: 4, track: "core", customItems: [] };
}

function emptyCourse(): Course {
  return { slug: "", title: "", subtitle: "", roleKeys: [], sections: [], isCustom: true };
}

const inputCls =
  "w-full rounded-lg border border-[#2a2418] bg-[#1a1710] px-3.5 py-2.5 text-sm text-[#f3ede1] outline-none transition-colors duration-150 placeholder:text-[#6b6354] focus:border-[#f2c368] focus:ring-2 focus:ring-[#f2c368]/15";
const smallInputCls =
  "w-full rounded-md border border-[#2a2418] bg-[#1a1710] px-2.5 py-1.5 text-xs text-[#f3ede1] outline-none transition-colors duration-150 placeholder:text-[#6b6354] focus:border-[#f2c368] focus:ring-2 focus:ring-[#f2c368]/15";
const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#8a8270]";

// Lets the admin search the 700+ tools already tracked in Roadmap data and pick
// one instead of typing a topic/sub-topic name from scratch.
function ToolNameInput({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  className: string;
  autoFocus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = value.toLowerCase().trim();
    if (!q) return [];
    return TOOL_CATALOG.filter((t) => t.tool.toLowerCase().includes(q)).slice(0, 8);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto divide-y divide-[#2a2418] rounded-lg border border-[#2a2418] bg-[#1a1710] shadow-xl">
          {results.map((t) => (
            <button
              key={t.tool}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(t.tool);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-[#f3ede1] transition-colors hover:bg-[#2a2418]"
            >
              <span className="truncate">{t.tool}</span>
              <span className="shrink-0 text-[10px] text-[#9a927e]">{t.count} roles</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesAdmin() {
  const { data } = useAppState();
  const { profile } = useAccess();
  const [courses, setCourses] = useState<Course[]>([]);
  const [draft, setDraft] = useState<Course | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin-courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.courses) setCourses(json.courses);
      })
      .catch(() => setStatus("Could not load courses — check the database connection."));
  }, []);

  const roleByKey = useMemo(() => {
    const map = new Map<string, (typeof data)[number]>();
    data.forEach((r) => map.set(keyFor(r), r));
    return map;
  }, [data]);

  const roleFilterResults = useMemo(() => {
    const q = roleSearch.toLowerCase().trim();
    if (!q || !draft) return [];
    const selected = new Set(draft.roleKeys || []);
    return data
      .filter((r) => !selected.has(keyFor(r)))
      .filter((r) => `${r.role} ${r.domain}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [data, roleSearch, draft]);

  function openCreateModal() {
    setDraft(emptyCourse());
    setStatus("");
    setModalOpen(true);
  }

  function openEditModal(c: Course) {
    setDraft(JSON.parse(JSON.stringify(c)));
    setStatus("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setDraft(null);
    setRoleSearch("");
    setStatus("");
  }

  async function handleCreate() {
    if (!draft || !draft.title.trim()) return;
    setCreating(true);
    setStatus("Creating...");
    try {
      const res = await fetch("/api/admin-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title.trim(),
          subtitle: draft.subtitle.trim(),
          roleKeys: draft.roleKeys || [],
          createdBy: profile,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setStatus(json.error || "Could not create course.");
        return;
      }
      setCourses((prev) => [...prev, json.course]);
      setDraft(json.course);
      setStatus("Course created — add modules below, then Save.");
    } catch {
      setStatus("Network error — could not create course.");
    } finally {
      setCreating(false);
    }
  }

  function updateDraft(mutator: (c: Course) => Course) {
    setDraft((prev) => (prev ? mutator(prev) : prev));
  }

  function toggleRole(key: string) {
    updateDraft((c) => {
      const current = c.roleKeys || [];
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      return { ...c, roleKeys: next };
    });
    setRoleSearch("");
  }

  function addSection() {
    updateDraft((c) => ({ ...c, sections: [...c.sections, emptySection()] }));
  }
  function updateSection(sectionId: string, patch: Partial<CourseSection>) {
    updateDraft((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
    }));
  }
  function removeSection(sectionId: string) {
    updateDraft((c) => ({ ...c, sections: c.sections.filter((s) => s.id !== sectionId) }));
  }

  function addItem(sectionId: string) {
    updateDraft((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === sectionId ? { ...s, customItems: [...(s.customItems || []), emptyItem()] } : s
      ),
    }));
  }
  function updateItem(sectionId: string, itemId: string, patch: Partial<CourseItem>) {
    updateDraft((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, customItems: (s.customItems || []).map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
      ),
    }));
  }
  function removeItem(sectionId: string, itemId: string) {
    updateDraft((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id !== sectionId ? s : { ...s, customItems: (s.customItems || []).filter((i) => i.id !== itemId) }
      ),
    }));
  }

  function addSubstep(sectionId: string, itemId: string) {
    updateDraft((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              customItems: (s.customItems || []).map((i) =>
                i.id === itemId ? { ...i, substeps: [...i.substeps, emptySubstep()] } : i
              ),
            }
      ),
    }));
  }
  function updateSubstep(sectionId: string, itemId: string, substepId: string, patch: Partial<CourseSubstep>) {
    updateDraft((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              customItems: (s.customItems || []).map((i) =>
                i.id !== itemId
                  ? i
                  : { ...i, substeps: i.substeps.map((sub) => (sub.id === substepId ? { ...sub, ...patch } : sub)) }
              ),
            }
      ),
    }));
  }
  function removeSubstep(sectionId: string, itemId: string, substepId: string) {
    updateDraft((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              customItems: (s.customItems || []).map((i) =>
                i.id !== itemId ? i : { ...i, substeps: i.substeps.filter((sub) => sub.id !== substepId) }
              ),
            }
      ),
    }));
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setStatus("Saving...");
    try {
      const res = await fetch("/api/admin-courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const json = await res.json();
      if (!json.ok) {
        setStatus(json.error || "Could not save course.");
      } else {
        setCourses((prev) => prev.map((c) => (c.slug === draft.slug ? draft : c)));
        setStatus("Saved.");
      }
    } catch {
      setStatus("Network error — could not save course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!draft) return;
    if (!confirm(`Delete "${draft.title}"? This can't be undone.`)) return;
    setStatus("Deleting...");
    try {
      const res = await fetch(`/api/admin-courses?id=${encodeURIComponent(draft.slug)}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        setStatus(json.error || "Could not delete course.");
        return;
      }
      setCourses((prev) => prev.filter((c) => c.slug !== draft.slug));
      closeModal();
    } catch {
      setStatus("Network error — could not delete course.");
    }
  }

  const isNew = draft ? !draft.slug : false;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#f3ede1]">Courses</h1>
          <p className="mt-1 text-sm text-[#9a927e]">
            Create courses with your own modules, topics, sub-topics, links, and ChatGPT prompts. These show
            up on the Courses page for both of you.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex shrink-0 items-center gap-1.5 bg-[#f2c368] px-4 py-2 text-sm font-medium text-[#12100a]"
        >
          <PlusIcon className="h-4 w-4" />
          Add course
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {courses.length === 0 ? (
          <p className="border border-dashed border-[#2a2418] p-6 text-center text-sm text-[#9a927e]">
            No courses yet — click &ldquo;Add course&rdquo; to create the first one.
          </p>
        ) : (
          courses.map((c) => (
            <button
              key={c.slug}
              onClick={() => openEditModal(c)}
              className="flex w-full items-center justify-between gap-3 border border-[#2a2418] bg-[#1a1710] px-4 py-3 text-left hover:border-[#f2c368]"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[#f3ede1]">{c.title}</div>
                {c.subtitle && <div className="truncate text-xs text-[#9a927e]">{c.subtitle}</div>}
              </div>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-[#9a927e]" />
            </button>
          ))
        )}
      </div>

      {modalOpen && draft && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <button
            aria-label="Close"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />
          <div className="animate-slide-in-right relative flex h-full w-full max-w-xl flex-col border-l border-[#2a2418] bg-[#14110a] shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[#2a2418] bg-gradient-to-b from-[#1a1710] to-[#14110a] px-6 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#f2c368]/80">
                  {isNew ? "New course" : "Editing course"}
                </p>
                <h2 className="mt-0.5 text-base font-semibold text-[#f3ede1]">
                  {isNew ? "Add course" : draft.title || "Edit course"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-1.5 text-[#9a927e] transition-colors hover:bg-[#2a2418] hover:text-[#f3ede1]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {status && (
                <p className="mb-4 rounded-lg border border-[#f2c368]/30 bg-[#f2c368]/10 px-3 py-2 text-xs font-medium text-[#f2c368]">
                  {status}
                </p>
              )}

              <div className="space-y-4 rounded-xl border border-[#2a2418] bg-[#1a1710]/60 p-4">
                <div>
                  <label className={labelCls}>Title</label>
                  <ToolNameInput
                    value={draft.title}
                    onChange={(v) => updateDraft((c) => ({ ...c, title: v }))}
                    placeholder="Search a tool/tech (e.g. AWS) or type a course title"
                    autoFocus
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Subtitle</label>
                  <input
                    value={draft.subtitle}
                    onChange={(e) => updateDraft((c) => ({ ...c, subtitle: e.target.value }))}
                    placeholder="One line describing what this course covers"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Related roles ({(draft.roleKeys || []).length} selected)
                  </label>
                  {(draft.roleKeys || []).length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {(draft.roleKeys || []).map((key) => {
                        const r = roleByKey.get(key);
                        if (!r) return null;
                        return (
                          <span
                            key={key}
                            className="flex items-center gap-1 rounded-full border border-[#f2c368]/40 bg-[#f2c368]/10 px-2.5 py-1 text-[11px] font-medium text-[#f2c368]"
                          >
                            {r.role}
                            <button onClick={() => toggleRole(key)} className="hover:text-[#e07a5f]">
                              <CloseIcon className="h-3 w-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a927e]" />
                    <input
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      placeholder="Search roles to tag..."
                      className="w-full rounded-lg border border-[#2a2418] bg-[#1a1710] py-2.5 pl-9 pr-3 text-sm text-[#f3ede1] outline-none transition-colors placeholder:text-[#6b6354] focus:border-[#f2c368] focus:ring-2 focus:ring-[#f2c368]/15"
                    />
                  </div>
                  {roleFilterResults.length > 0 && (
                    <div className="mt-1.5 divide-y divide-[#2a2418] overflow-hidden rounded-lg border border-[#2a2418]">
                      {roleFilterResults.map((r) => (
                        <button
                          key={keyFor(r)}
                          onClick={() => toggleRole(keyFor(r))}
                          className="flex w-full items-center justify-between gap-2 bg-[#1a1710] px-3 py-2 text-left text-sm text-[#f3ede1] transition-colors hover:bg-[#2a2418]"
                        >
                          <span className="truncate">{r.role}</span>
                          <span className="shrink-0 text-[11px] text-[#9a927e]">{stripEmoji(r.domain)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isNew ? (
                <button
                  onClick={handleCreate}
                  disabled={!draft.title.trim() || creating}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-[#f5cd7a] to-[#f2c368] px-4 py-2.5 text-sm font-semibold text-[#12100a] shadow-lg shadow-[#f2c368]/10 transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <PlusIcon className="h-4 w-4" />
                  {creating ? "Creating..." : "Create course"}
                </button>
              ) : (
                <>
                  <div className="mt-6 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a8270]">
                      Modules
                    </p>
                    {draft.sections.map((sec) => (
                      <SectionEditor
                        key={sec.id}
                        section={sec}
                        onUpdate={(patch) => updateSection(sec.id, patch)}
                        onRemove={() => removeSection(sec.id)}
                        onAddItem={() => addItem(sec.id)}
                        onUpdateItem={(itemId, patch) => updateItem(sec.id, itemId, patch)}
                        onRemoveItem={(itemId) => removeItem(sec.id, itemId)}
                        onAddSubstep={(itemId) => addSubstep(sec.id, itemId)}
                        onUpdateSubstep={(itemId, substepId, patch) => updateSubstep(sec.id, itemId, substepId, patch)}
                        onRemoveSubstep={(itemId, substepId) => removeSubstep(sec.id, itemId, substepId)}
                      />
                    ))}
                    <button
                      onClick={addSection}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#2a2418] py-3 text-sm font-medium text-[#9a927e] transition-colors hover:border-[#f2c368] hover:text-[#f2c368]"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add module
                    </button>
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-[#2a2418] pt-5">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-lg bg-gradient-to-b from-[#f5cd7a] to-[#f2c368] px-4 py-2.5 text-sm font-semibold text-[#12100a] shadow-lg shadow-[#f2c368]/10 transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save course"}
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 rounded-lg border border-[#2a2418] px-4 py-2.5 text-sm font-medium text-[#9a927e] transition-colors hover:border-[#e07a5f] hover:text-[#e07a5f]"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete course
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  onUpdate,
  onRemove,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddSubstep,
  onUpdateSubstep,
  onRemoveSubstep,
}: {
  section: CourseSection;
  onUpdate: (patch: Partial<CourseSection>) => void;
  onRemove: () => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, patch: Partial<CourseItem>) => void;
  onRemoveItem: (itemId: string) => void;
  onAddSubstep: (itemId: string) => void;
  onUpdateSubstep: (itemId: string, substepId: string, patch: Partial<CourseSubstep>) => void;
  onRemoveSubstep: (itemId: string, substepId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-[#2a2418] bg-[#1a1710]">
      <div className="flex items-center gap-2 p-3">
        <button onClick={() => setOpen((v) => !v)} className="shrink-0 text-[#9a927e]">
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Module title"
          className={smallInputCls}
        />
        <select
          value={section.priority}
          onChange={(e) => onUpdate({ priority: Number(e.target.value) as 5 | 4 | 0 })}
          className="shrink-0 border border-[#2a2418] bg-[#1a1710] px-2 py-1.5 text-xs text-[#f3ede1]"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={section.track}
          onChange={(e) => onUpdate({ track: e.target.value as CourseTrack })}
          className="shrink-0 border border-[#2a2418] bg-[#1a1710] px-2 py-1.5 text-xs text-[#f3ede1]"
        >
          {TRACKS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button onClick={onRemove} className="shrink-0 p-1.5 text-[#9a927e] hover:text-[#e07a5f]">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="space-y-3 border-t border-[#2a2418] p-3">
          <input
            value={section.note || ""}
            onChange={(e) => onUpdate({ note: e.target.value })}
            placeholder="Note shown under the module (optional)"
            className={smallInputCls}
          />

          {(section.customItems || []).map((item) => (
            <ItemEditor
              key={item.id}
              item={item}
              onUpdate={(patch) => onUpdateItem(item.id, patch)}
              onRemove={() => onRemoveItem(item.id)}
              onAddSubstep={() => onAddSubstep(item.id)}
              onUpdateSubstep={(substepId, patch) => onUpdateSubstep(item.id, substepId, patch)}
              onRemoveSubstep={(substepId) => onRemoveSubstep(item.id, substepId)}
            />
          ))}
          <button
            onClick={onAddItem}
            className="flex w-full items-center justify-center gap-1.5 border border-dashed border-[#2a2418] py-2 text-xs font-medium text-[#9a927e] hover:border-[#f2c368] hover:text-[#f2c368]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            Add topic
          </button>
        </div>
      )}
    </div>
  );
}

function ItemEditor({
  item,
  onUpdate,
  onRemove,
  onAddSubstep,
  onUpdateSubstep,
  onRemoveSubstep,
}: {
  item: CourseItem;
  onUpdate: (patch: Partial<CourseItem>) => void;
  onRemove: () => void;
  onAddSubstep: () => void;
  onUpdateSubstep: (substepId: string, patch: Partial<CourseSubstep>) => void;
  onRemoveSubstep: (substepId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-[#2a2418] bg-[#12100a]">
      <div className="flex items-center gap-2 p-2.5">
        <button onClick={() => setOpen((v) => !v)} className="shrink-0 text-[#9a927e]">
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <input
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Topic title (e.g. Linux)"
          className={smallInputCls}
        />
        <button onClick={onRemove} className="shrink-0 p-1 text-[#9a927e] hover:text-[#e07a5f]">
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="space-y-2.5 border-t border-[#2a2418] p-2.5">
          <div>
            <label className="mb-1 block text-[11px] text-[#9a927e]">
              Whole-topic ChatGPT prompt (optional — covers all of this topic at once)
            </label>
            <textarea
              value={item.wholePrompt}
              onChange={(e) => onUpdate({ wholePrompt: e.target.value })}
              rows={2}
              placeholder={`Leave blank to auto-generate a default prompt for "${item.title || "this topic"}"`}
              className={smallInputCls}
            />
          </div>

          {item.substeps.map((s) => (
            <div key={s.id} className="space-y-2 border border-[#2a2418] bg-[#1a1710] p-2.5">
              <div className="flex items-center gap-2">
                <input
                  value={s.label}
                  onChange={(e) => onUpdateSubstep(s.id, { label: e.target.value })}
                  placeholder="Sub-topic name (e.g. File permissions)"
                  className={smallInputCls}
                />
                <button onClick={() => onRemoveSubstep(s.id)} className="shrink-0 p-1 text-[#9a927e] hover:text-[#e07a5f]">
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                value={s.whatYouLearn}
                onChange={(e) => onUpdateSubstep(s.id, { whatYouLearn: e.target.value })}
                placeholder="What you'll learn / why it matters"
                rows={2}
                className={smallInputCls}
              />
              <div className="flex gap-2">
                <select
                  value={s.resourceType}
                  onChange={(e) => onUpdateSubstep(s.id, { resourceType: e.target.value as ResourceType })}
                  className="shrink-0 border border-[#2a2418] bg-[#12100a] px-2 py-1.5 text-xs text-[#f3ede1]"
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  value={s.resourceUrl}
                  onChange={(e) => onUpdateSubstep(s.id, { resourceUrl: e.target.value })}
                  placeholder="https://..."
                  className={smallInputCls}
                />
              </div>
              <textarea
                value={s.prompt}
                onChange={(e) => onUpdateSubstep(s.id, { prompt: e.target.value })}
                placeholder="ChatGPT prompt for this sub-topic (optional)"
                rows={2}
                className={smallInputCls}
              />
            </div>
          ))}
          <button
            onClick={onAddSubstep}
            className="flex w-full items-center justify-center gap-1.5 border border-dashed border-[#2a2418] py-1.5 text-[11px] font-medium text-[#9a927e] hover:border-[#f2c368] hover:text-[#f2c368]"
          >
            <PlusIcon className="h-3 w-3" />
            Add sub-topic
          </button>
        </div>
      )}
    </div>
  );
}
