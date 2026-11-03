// Local calendar-day key (not toISOString/UTC) — using UTC here would shift
// the date backward for positive UTC offsets (e.g. IST) near local midnight.
// Plain, framework-free module (no "use client") so it's safe to import from
// both client components and server-only code (API route handlers) — unlike
// importing it from AppStateContext.tsx, which is a "use client" module and
// crashes at runtime when pulled into a Route Handler's server bundle.
export function todayKey(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
