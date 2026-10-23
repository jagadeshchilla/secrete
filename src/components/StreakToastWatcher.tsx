"use client";

import { useEffect, useRef, useState } from "react";
import { useIdeas } from "@/context/IdeasContext";
import { useResearch } from "@/context/ResearchContext";
import { useFreelance } from "@/context/FreelanceContext";
import { computeStreak } from "@/context/AppStateContext";
import { buildActivityMap } from "@/lib/activityHeatmap";
import { useToast } from "@/context/ToastContext";
import type { Course } from "@/types/course";

// Watches ideas/research/freelancing for new additions and, when one lands,
// shows a toast with the current combined activity streak — a lightweight
// nudge that today's action kept (or started) the streak, without needing
// every add-action across three separate contexts to know about toasts.
export default function StreakToastWatcher() {
  const { ideas } = useIdeas();
  const { papers } = useResearch();
  const { gigs } = useFreelance();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch("/api/admin-courses")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.courses) setCourses(json.courses);
      })
      .catch(() => {
        // offline or DB not configured yet
      });
  }, []);

  const prevCounts = useRef<{ ideas: number; papers: number; gigs: number } | null>(null);

  useEffect(() => {
    const counts = { ideas: ideas.length, papers: papers.length, gigs: gigs.length };
    const prev = prevCounts.current;
    prevCounts.current = counts;

    // Skip the very first run (initial hydration) — only toast on real growth.
    if (!prev) return;
    const grew = counts.ideas > prev.ideas || counts.papers > prev.papers || counts.gigs > prev.gigs;
    if (!grew) return;

    const activityMap = buildActivityMap({ ideas, papers, gigs, courses }, null);
    const streak = computeStreak(activityMap);
    showToast(
      streak.current > 1
        ? `🔥 ${streak.current} day streak — keep it going!`
        : "🔥 Streak started today — nice!"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas.length, papers.length, gigs.length]);

  return null;
}
