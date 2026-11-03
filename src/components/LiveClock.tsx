"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@/components/icons";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Premium live clock: ticks every second on the client only, so the
// server-rendered shell never mismatches the client's actual time/timezone.
export default function LiveClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 1000);
    // Defer the first tick to a callback (not a direct effect-body call) so
    // the server-rendered shell (null) can hydrate before time appears.
    const t = setTimeout(tick, 0);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, []);

  if (!now) {
    return compact ? null : (
      <div className="surface-card animate-fade-in-up p-4">
        <div className="h-12" />
      </div>
    );
  }

  let hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold tabular-nums tracking-tight">
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
        <span className="text-xs text-[var(--muted)]">{ampm}</span>
      </div>
    );
  }

  return (
    <div className="surface-card animate-fade-in-up flex items-center gap-4 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
        <ClockIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {pad(hours)}:{pad(minutes)}:{pad(seconds)}
          </span>
          <span className="text-xs font-medium text-[var(--muted)]">{ampm}</span>
        </div>
        <div className="mt-0.5 text-xs text-[var(--muted)]">{dateLabel}</div>
      </div>
    </div>
  );
}
