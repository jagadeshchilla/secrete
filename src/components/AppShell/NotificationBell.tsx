"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useAccess } from "@/context/AccessContext";
import type { Course } from "@/types/course";
import { BellIcon, GraduationCapIcon } from "@/components/icons";

function lastSeenKey(profile: string) {
  return `courseNotifLastSeen::${profile}`;
}

export default function NotificationBell({ align = "left" }: { align?: "left" | "right" }) {
  const { profile } = useAccess();
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>("");
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!profile) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastSeen(localStorage.getItem(lastSeenKey(profile)) || "");
    } catch {
      // ignore
    }
    fetch("/api/admin-courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.courses) setCourses(json.courses);
      })
      .catch(() => {
        // offline or DB not configured yet
      });
  }, [profile]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    // Scroll or resize can move the button out from under a fixed-position
    // panel computed from a one-time getBoundingClientRect — closing is
    // simpler and safer than tracking every possible scroll container.
    function onScrollOrResize() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  const announcements = courses
    .filter((c) => c.createdAt)
    .sort((a, b) => (a.createdAt! < b.createdAt! ? 1 : -1))
    .slice(0, 15);

  const unreadCount = lastSeen ? announcements.filter((c) => c.createdAt! > lastSeen).length : announcements.length;

  function handleToggle() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) {
          const panelWidth = 320;
          const left =
            align === "left"
              ? Math.min(rect.left, window.innerWidth - panelWidth - 16)
              : Math.max(rect.right - panelWidth, 16);
          setCoords({ top: rect.bottom + 8, left });
        }
        if (profile && announcements.length > 0) {
          const newest = announcements[0].createdAt!;
          try {
            localStorage.setItem(lastSeenKey(profile), newest);
          } catch {
            // ignore
          }
          setLastSeen(newest);
        }
      }
      return next;
    });
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-[var(--accent)]" />
        )}
      </button>

      {open &&
        mounted &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: coords.top, left: coords.left }}
            className="animate-fade-in-up fixed z-[999] w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
          >
            <div className="border-b border-[var(--border)] px-4 py-3">
              <h3 className="text-sm font-semibold">Announcements</h3>
              <p className="mt-0.5 text-xs text-[var(--muted)]">New courses added by Admin</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {announcements.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-[var(--muted)]">No announcements yet.</p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {announcements.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/courses/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-2.5 px-4 py-3 hover:bg-[var(--surface-2)]"
                      >
                        <GraduationCapIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                        <div className="min-w-0">
                          <p className="text-sm">
                            New course added: <strong className="font-medium">{c.title}</strong>
                          </p>
                          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                            {new Date(c.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
