"use client";

import { useMemo, useState } from "react";

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function levelFor(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const HEAT_VARS = ["--heat-0", "--heat-1", "--heat-2", "--heat-3", "--heat-4"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Cell {
  date: string;
  day: number;
  count: number;
  inMonth: boolean;
  isFuture: boolean;
}

export default function MonthCalendar({ activityByDate }: { activityByDate: Map<string, number> }) {
  const [hovered, setHovered] = useState<{ date: string; count: number } | null>(null);

  const { rows, monthLabel } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = today.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const gridStart = new Date(first);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    const gridEnd = new Date(last);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

    const wks: Cell[][] = [];
    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      const row: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const key = toKey(cursor);
        row.push({
          date: key,
          day: cursor.getDate(),
          count: activityByDate.get(key) || 0,
          inMonth: cursor.getMonth() === month,
          isFuture: cursor > today,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      wks.push(row);
    }
    return { rows: wks, monthLabel: first.toLocaleDateString("en-US", { month: "long", year: "numeric" }) };
  }, [activityByDate]);

  return (
    <div className="w-full">
      <div className="mb-2 text-xs font-medium text-[var(--muted)]">{monthLabel}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--muted)]">
        {WEEKDAY_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {rows.map((row, ri) => (
          <div className="grid grid-cols-7 gap-1" key={ri}>
            {row.map((cell) => {
              const level = levelFor(cell.count);
              const hoverable = cell.inMonth && !cell.isFuture;
              const hasActivity = cell.inMonth && !cell.isFuture && cell.count > 0;
              return (
                <div
                  key={cell.date}
                  onMouseEnter={() => hoverable && setHovered(cell)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex aspect-square items-center justify-center rounded-[4px] border border-transparent text-[11px]"
                  style={{
                    background: hasActivity ? `var(${HEAT_VARS[level]})` : "transparent",
                    borderColor: cell.date === toKey(new Date()) ? "var(--accent)" : "transparent",
                    color: !cell.inMonth ? "var(--border)" : level >= 3 ? "white" : "var(--text)",
                    opacity: cell.inMonth ? 1 : 0.4,
                  }}
                >
                  {cell.day}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 h-4 text-xs text-[var(--muted)]">
        {hovered ? (
          <span>
            <strong className="text-[var(--text)]">{hovered.count}</strong> update
            {hovered.count === 1 ? "" : "s"} on {hovered.date}
          </span>
        ) : (
          <span>Hover a day to see activity</span>
        )}
      </div>
    </div>
  );
}
