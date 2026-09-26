"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAccess } from "@/context/AccessContext";
import { PROFILES, PROFILE_LABELS } from "@/config/access";
import { ChevronDownIcon, CheckIcon, LockIcon, WrenchIcon } from "@/components/icons";

export default function ProfileSwitcher() {
  const { profile, chooseProfile, lock } = useAccess();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!profile) return null;

  return (
    <div ref={rootRef} className="relative px-3 py-3 border-b border-[var(--border)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-2 py-2 text-left hover:bg-[var(--surface-2)]"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
          {PROFILE_LABELS[profile].charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{PROFILE_LABELS[profile]}</span>
          <span className="block text-[11px] text-[var(--muted)]">Switch profile</span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="animate-scale-in absolute left-3 right-3 top-full z-20 mt-1 border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          {PROFILES.map((p) => (
            <button
              key={p}
              onClick={() => {
                chooseProfile(p);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-[var(--surface-2)]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[var(--accent-soft)] text-[11px] font-semibold text-[var(--accent)]">
                {PROFILE_LABELS[p].charAt(0)}
              </span>
              <span className="flex-1">{PROFILE_LABELS[p]}</span>
              {p === profile && <CheckIcon className="h-4 w-4 text-[var(--accent)]" />}
            </button>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 border-t border-[var(--border)] px-3 py-2.5 text-left text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <WrenchIcon className="h-4 w-4" />
            </span>
            <span className="flex-1">Admin</span>
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              lock();
            }}
            className="flex w-full items-center gap-2.5 border-t border-[var(--border)] px-3 py-2.5 text-left text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--bad)]"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <LockIcon className="h-4 w-4" />
            </span>
            <span className="flex-1">Lock this device</span>
          </button>
        </div>
      )}
    </div>
  );
}
