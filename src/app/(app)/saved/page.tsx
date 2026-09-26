"use client";

import { useMemo, useState } from "react";
import { useAppState, keyFor } from "@/context/AppStateContext";
import type { CareerRole } from "@/types/career";
import RoleCard from "@/components/RoleCard";
import RoleDrawer from "@/components/RoleDrawer";
import { BookmarkIcon } from "@/components/icons";

export default function SavedPage() {
  const { data, getRecord, setStatus, setNote } = useAppState();
  const [active, setActive] = useState<CareerRole | null>(null);

  const saved = useMemo(() => data.filter((r) => getRecord(r).saved), [data, getRecord]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Roles you bookmarked with the save icon — {saved.length} total.
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 border border-dashed border-[var(--border)] p-12 text-center">
          <BookmarkIcon className="h-8 w-8 text-[var(--muted)]" />
          <p className="text-sm text-[var(--muted)]">
            Nothing saved yet. Click the bookmark icon on a role card to save it here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((role, i) => (
            <RoleCard
              key={keyFor(role)}
              role={role}
              record={getRecord(role)}
              onOpen={() => setActive(role)}
              onStatusChange={(field, value) => setStatus(role, field, value)}
              style={{ animationDelay: `${Math.min(i, 20) * 25}ms` }}
            />
          ))}
        </div>
      )}

      <RoleDrawer
        role={active}
        record={active ? getRecord(active) : {}}
        onClose={() => setActive(null)}
        onStatusChange={(field, value) => active && setStatus(active, field, value)}
        onNoteChange={(value) => active && setNote(active, value)}
      />
    </div>
  );
}
