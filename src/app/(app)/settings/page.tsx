"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { useAccess } from "@/context/AccessContext";
import { PROFILES, PROFILE_LABELS } from "@/config/access";
import { SunIcon, MoonIcon, DownloadIcon, UploadIcon, CopyIcon, LinkIcon } from "@/components/icons";

export default function SettingsPage() {
  const { theme, toggleTheme, exportProgress, importProgress } = useAppState();
  const { profile, chooseProfile, lock } = useAccess();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareText, setShareText] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordStatus(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.ok) {
        setPasswordStatus({ ok: true, message: "Password changed." });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordStatus({ ok: false, message: json.error || "Could not change password." });
      }
    } catch {
      setPasswordStatus({ ok: false, message: "Network error — try again." });
    } finally {
      setChangingPassword(false);
    }
  }

  function handleExport() {
    const json = exportProgress();
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "career-research-progress.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importProgress(reader.result as string);
      alert(ok ? "Progress imported successfully." : "Invalid progress file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleGenerateShare() {
    setShareText(exportProgress());
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Theme, backups, and sharing your progress.</p>
      </div>

      <section className="animate-fade-in-up mt-6 border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold">Profile</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          You&apos;re currently marking progress as <strong>{profile ? PROFILE_LABELS[profile] : "—"}</strong>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROFILES.map((p) => (
            <button
              key={p}
              onClick={() => chooseProfile(p)}
              className={`border px-4 py-2 text-sm font-medium transition-colors ${
                profile === p
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--accent)]"
              }`}
            >
              {PROFILE_LABELS[p]}
            </button>
          ))}
        </div>
        <button
          onClick={lock}
          className="mt-3 border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-xs font-medium text-[var(--muted)] hover:border-[var(--bad)] hover:text-[var(--bad)]"
        >
          Lock this device
        </button>
      </section>

      <section
        className="animate-fade-in-up mt-4 border border-[var(--border)] bg-[var(--surface)] p-5"
        style={{ animationDelay: "20ms" }}
      >
        <h2 className="text-sm font-semibold">Site password</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          The shared password both of you use to unlock the app — stored hashed in the database, not in
          the code.
        </p>
        <form onSubmit={handleChangePassword} className="mt-3 flex flex-wrap gap-2">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            autoComplete="off"
            className="border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            autoComplete="off"
            className="border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={changingPassword || !currentPassword || !newPassword}
            className="border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)] disabled:opacity-50"
          >
            {changingPassword ? "Saving..." : "Change password"}
          </button>
        </form>
        {passwordStatus && (
          <p className={`mt-2 text-xs ${passwordStatus.ok ? "text-[var(--good)]" : "text-[var(--bad)]"}`}>
            {passwordStatus.message}
          </p>
        )}
      </section>

      <section
        className="animate-fade-in-up mt-4 border border-[var(--border)] bg-[var(--surface)] p-5"
        style={{ animationDelay: "40ms" }}
      >
        <h2 className="text-sm font-semibold">Appearance</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">Switch between light and dark mode.</p>
        <button
          onClick={toggleTheme}
          className="btn-shimmer mt-3 inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        </button>
      </section>

      <section
        className="animate-fade-in-up mt-4 border border-[var(--border)] bg-[var(--surface)] p-5"
        style={{ animationDelay: "60ms" }}
      >
        <h2 className="text-sm font-semibold">Backup your progress</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Progress is stored only in this browser. Export a backup, or import one on another device.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
          >
            <DownloadIcon className="h-4 w-4" />
            Export progress
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
          >
            <UploadIcon className="h-4 w-4" />
            Import progress
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </section>

      <section
        className="animate-fade-in-up mt-4 border border-[var(--border)] bg-[var(--surface)] p-5"
        style={{ animationDelay: "120ms" }}
      >
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold">Share / Sync with your partner</h2>
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Generate a shareable progress payload and send it — the other person can Import it above. For
          real-time shared progress, connect this app to a hosted database (e.g. Supabase) with a
          structure like <code>users → research_progress → role_id → status → notes → updated_at</code>.
        </p>
        <button
          onClick={handleGenerateShare}
          className="mt-3 border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm font-medium hover:border-[var(--accent)]"
        >
          Generate share text
        </button>
        {shareText && (
          <div className="mt-3">
            <textarea
              readOnly
              value={shareText}
              rows={8}
              className="w-full border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs"
            />
            <button
              onClick={handleCopy}
              className="mt-2 inline-flex items-center gap-2 border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent)]"
            >
              <CopyIcon className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
