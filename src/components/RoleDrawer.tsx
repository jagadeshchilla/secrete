"use client";

import type { CareerRole, ProgressRecord, StatusField } from "@/types/career";
import { CloseIcon, BookmarkIcon, PlayIcon, ExternalLinkIcon } from "@/components/icons";
import StatusPills from "@/components/StatusPills";
import { stripEmoji, keyFor } from "@/context/AppStateContext";
import { useResources } from "@/context/ResourcesContext";
import { useAccess } from "@/context/AccessContext";

export default function RoleDrawer({
  role,
  record,
  onClose,
  onStatusChange,
  onNoteChange,
}: {
  role: CareerRole | null;
  record: ProgressRecord;
  onClose: () => void;
  onStatusChange: (field: StatusField, value: boolean) => void;
  onNoteChange: (value: string) => void;
}) {
  const open = !!role;
  const { getResources } = useResources();
  const { profile } = useAccess();
  const resources = role ? getResources(keyFor(role)) : [];

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-200 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {role && (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] p-5">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
                  {stripEmoji(role.domain)}
                </div>
                <h2 className="mt-1 text-lg font-semibold leading-snug">{role.role}</h2>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => onStatusChange("saved", !record.saved)}
                  title={record.saved ? "Remove from Saved" : "Save this role"}
                  className={`border p-1.5 transition-colors ${
                    record.saved
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)]"
                  }`}
                >
                  <BookmarkIcon className="h-4 w-4" filled={record.saved} />
                </button>
                <button
                  onClick={onClose}
                  className="border border-[var(--border)] p-1.5 text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <p className="text-sm leading-relaxed text-[var(--muted)]">{role.description}</p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="border border-[var(--border)] p-2.5">
                  <div className="text-[11px] text-[var(--muted)]">Coding</div>
                  <div className="mt-0.5 text-sm font-medium">{role.coding}</div>
                </div>
                <div className="border border-[var(--border)] p-2.5">
                  <div className="text-[11px] text-[var(--muted)]">AI impact</div>
                  <div className="mt-0.5 text-sm font-medium">{role.ai}</div>
                </div>
                <div className="border border-[var(--border)] p-2.5">
                  <div className="text-[11px] text-[var(--muted)]">Outlook</div>
                  <div className="mt-0.5 text-sm font-medium">{role.outlook}</div>
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-medium text-[var(--muted)]">Your status</div>
                <StatusPills record={record} onChange={onStatusChange} />
              </div>

              {resources.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-medium text-[var(--muted)]">Learning resources</div>
                  <div className="space-y-2">
                    {resources.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 border border-[var(--border)] p-2.5 text-sm hover:border-[var(--accent)]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <PlayIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                          <span className="truncate">{r.title}</span>
                        </span>
                        <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--muted)]">Your notes</label>
                <textarea
                  key={`${keyFor(role)}::${profile}`}
                  defaultValue={record.notes || ""}
                  onBlur={(e) => onNoteChange(e.target.value)}
                  rows={6}
                  placeholder="What did you learn about this role?"
                  className="w-full border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
