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
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function HeatmapCalendar({
  activityByDate,
  weeks = 18,
  mode = "rolling",
}: {
  activityByDate: Map<string, number>;
  weeks?: number;
  mode?: "rolling" | "year";
}) {
  const [hovered, setHovered] = useState<{ date: string; count: number } | null>(null);

  const { columns, monthMarkers } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start: Date;
    let totalWeeks: number;
    const currentYear = today.getFullYear();

    if (mode === "year") {
      start = new Date(currentYear, 0, 1);
      start.setDate(start.getDate() - start.getDay());
      const yearEnd = new Date(currentYear, 11, 31);
      yearEnd.setDate(yearEnd.getDate() + (6 - yearEnd.getDay()));
      totalWeeks = Math.round((yearEnd.getTime() - start.getTime()) / (7 * 86400000)) + 1;
    } else {
      const end = new Date(today);
      // align to the following Saturday so the grid ends on a full week
      end.setDate(end.getDate() + (6 - end.getDay()));
      start = new Date(end);
      start.setDate(start.getDate() - weeks * 7 + 1);
      totalWeeks = weeks;
    }

    const cols: { date: string; count: number; inRange: boolean }[][] = [];
    const markers: { index: number; label: string }[] = [];
    let lastMonth = -1;
    const cursor = new Date(start);

    for (let w = 0; w < totalWeeks; w++) {
      const col: { date: string; count: number; inRange: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const key = toKey(cursor);
        const inRange =
          mode === "year"
            ? cursor.getFullYear() === currentYear && cursor <= today
            : cursor >= start && cursor <= today;
        col.push({ date: key, count: activityByDate.get(key) || 0, inRange });
        if (d === 0 && cursor.getMonth() !== lastMonth) {
          lastMonth = cursor.getMonth();
          markers.push({ index: w, label: MONTH_LABELS[lastMonth] });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(col);
    }
    return { columns: cols, monthMarkers: markers };
  }, [activityByDate, weeks, mode]);

  return (
    <div className="inline-block">
      <div className="flex gap-[3px] pl-6 mb-1 relative h-4">
        {monthMarkers.map((m) => (
          <span
            key={`${m.index}-${m.label}`}
            className="absolute text-[11px] text-[var(--muted)]"
            style={{ left: m.index * 13 }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className="flex gap-[3px]">
        <div className="flex flex-col gap-[3px] pr-1 justify-between text-[10px] text-[var(--muted)] h-[91px]">
          <span>Sun</span>
          <span>Wed</span>
          <span>Sat</span>
        </div>
        {columns.map((col, ci) => (
          <div className="flex flex-col gap-[3px]" key={ci}>
            {col.map((cell) => (
              <div
                key={cell.date}
                onMouseEnter={() => cell.inRange && setHovered(cell)}
                onMouseLeave={() => setHovered(null)}
                className="h-[10px] w-[10px] rounded-[2px] border border-[var(--border)]"
                style={{
                  background: cell.inRange && cell.count > 0 ? `var(${HEAT_VARS[levelFor(cell.count)]})` : "transparent",
                  borderColor: cell.inRange ? "var(--border)" : "transparent",
                }}
              />
            ))}
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
