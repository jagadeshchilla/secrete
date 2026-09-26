import Link from "next/link";
import type { CareerRole, ProgressRecord, StatusField } from "@/types/career";
import StatusPills from "@/components/StatusPills";
import { keyFor } from "@/context/AppStateContext";
import { ROADMAP_DATA } from "@/data/roadmapData";
import { BookmarkIcon, RouteIcon } from "@/components/icons";

export default function RoleCard({
  role,
  record,
  onOpen,
  onStatusChange,
  style,
}: {
  role: CareerRole;
  record: ProgressRecord;
  onOpen: () => void;
  onStatusChange: (field: StatusField, value: boolean) => void;
  style?: React.CSSProperties;
}) {
  const hasRoadmap = !!ROADMAP_DATA[keyFor(role)];

  return (
    <article
      onClick={onOpen}
      style={style}
      className={`card-hover animate-fade-in-up relative flex cursor-pointer flex-col gap-3 border bg-[var(--surface)] p-4 ${
        record.completed ? "border-[var(--good)]" : "border-[var(--border)]"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange("saved", !record.saved);
        }}
        title={record.saved ? "Remove from Saved" : "Save this role"}
        className={`absolute right-3 top-3 p-1.5 transition-colors ${
          record.saved
            ? "text-[var(--accent)]"
            : "text-[var(--muted)] hover:text-[var(--accent)]"
        }`}
      >
        <BookmarkIcon className="h-[18px] w-[18px]" filled={record.saved} />
      </button>

      <div className="flex items-start justify-between gap-2 pr-7">
        <h3 className="text-sm font-semibold leading-snug">{role.role}</h3>
        <span className="shrink-0 border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
          {role.type}
        </span>
      </div>
      <p className="line-clamp-3 text-xs leading-relaxed text-[var(--muted)]">{role.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <span className="border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
          Coding: {role.coding}
        </span>
        <span className="border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
          AI: {role.ai}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <StatusPills record={record} onChange={onStatusChange} compact />
        {hasRoadmap && (
          <Link
            href={`/roadmap?domain=${encodeURIComponent(role.domain)}&role=${encodeURIComponent(role.role)}`}
            onClick={(e) => e.stopPropagation()}
            title="View roadmap for this role"
            className="flex shrink-0 items-center gap-1 border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <RouteIcon className="h-3 w-3" />
            Roadmap
          </Link>
        )}
      </div>
    </article>
  );
}
