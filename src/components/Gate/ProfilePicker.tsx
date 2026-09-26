"use client";

import { useAccess } from "@/context/AccessContext";
import { PROFILES, PROFILE_LABELS } from "@/config/access";

export default function ProfilePicker() {
  const { chooseProfile } = useAccess();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[var(--bg)] px-6 text-center">
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-semibold text-[var(--text)]">Who&apos;s opening this?</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Pick your profile to continue.</p>
      </div>

      <div className="animate-fade-in-up flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "100ms" }}>
        {PROFILES.map((p) => (
          <button
            key={p}
            onClick={() => chooseProfile(p)}
            className="card-hover flex w-56 flex-col items-center gap-3 border border-[var(--border)] bg-[var(--surface)] px-6 py-8"
          >
            <span className="flex h-12 w-12 items-center justify-center bg-[var(--accent-soft)] text-lg font-semibold text-[var(--accent)]">
              {PROFILE_LABELS[p].charAt(0)}
            </span>
            <span className="text-sm font-medium text-[var(--text)]">{PROFILE_LABELS[p]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
