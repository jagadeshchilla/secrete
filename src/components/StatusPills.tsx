import type { ProgressRecord, StatusField } from "@/types/career";
import { CheckIcon } from "@/components/icons";

const FIELDS: { field: StatusField; label: string }[] = [
  { field: "researched", label: "Researched" },
  { field: "interested", label: "Interested" },
  { field: "completed", label: "Completed" },
];

export default function StatusPills({
  record,
  onChange,
  compact = false,
}: {
  record: ProgressRecord;
  onChange: (field: StatusField, value: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
      {FIELDS.map(({ field, label }) => {
        const active = !!record[field];
        return (
          <button
            key={field}
            onClick={() => onChange(field, !active)}
            className={`inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
              active
                ? "border-[var(--good)] bg-[var(--good-soft)] text-[var(--good)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            {active && <CheckIcon className="h-3 w-3" />}
            {compact ? label.slice(0, 1) + label.slice(1, 3) : label}
          </button>
        );
      })}
    </div>
  );
}
