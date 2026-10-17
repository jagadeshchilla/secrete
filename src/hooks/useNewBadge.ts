"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccess } from "@/context/AccessContext";

function storageKey(section: string, profile: string) {
  return `newBadge::${section}::${profile}`;
}

/**
 * Tracks, per profile, which items in a section (courses, ideas, research
 * papers, ...) the current profile hasn't seen yet — "unseen" meaning its
 * timestamp is newer than the last time this profile visited that section.
 * Mirrors the same lastSeen-in-localStorage pattern already used by the
 * course-announcement NotificationBell.
 */
export function useNewBadge(section: string, timestamps: string[]) {
  const { profile } = useAccess();
  const [lastSeen, setLastSeenState] = useState("");

  useEffect(() => {
    if (!profile) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastSeenState(localStorage.getItem(storageKey(section, profile)) || "");
    } catch {
      // ignore
    }
  }, [profile, section]);

  const isNew = useCallback(
    (createdAt: string) => !!profile && !!createdAt && (!lastSeen || createdAt > lastSeen),
    [profile, lastSeen]
  );

  const newCount = timestamps.filter(isNew).length;

  const markSeen = useCallback(() => {
    if (!profile) return;
    const latest = timestamps.reduce((a, b) => (a > b ? a : b), lastSeen);
    if (!latest) return;
    try {
      localStorage.setItem(storageKey(section, profile), latest);
    } catch {
      // ignore
    }
    setLastSeenState(latest);
  }, [profile, section, timestamps, lastSeen]);

  return { newCount, isNew, markSeen };
}
