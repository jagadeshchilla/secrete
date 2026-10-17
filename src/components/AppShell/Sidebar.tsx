"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { useIdeas } from "@/context/IdeasContext";
import { useResearch } from "@/context/ResearchContext";
import { useFreelance } from "@/context/FreelanceContext";
import { useNewBadge } from "@/hooks/useNewBadge";
import { CERTIFICATIONS } from "@/lib/certifications";
import type { Course } from "@/types/course";
import ProfileSwitcher from "./ProfileSwitcher";
import NotificationBell from "./NotificationBell";
import {
  HomeIcon,
  GridIcon,
  CalendarIcon,
  BookmarkIcon,
  SettingsIcon,
  SunIcon,
  MoonIcon,
  RouteIcon,
  GraduationCapIcon,
  LightbulbIcon,
  FlaskIcon,
  BriefcaseIcon,
  AwardIcon,
} from "@/components/icons";

type NavSection = "courses" | "ideas" | "research" | "freelancing" | "certifications";

const NAV_ITEMS: { href: string; label: string; icon: typeof HomeIcon; section?: NavSection }[] = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/roles", label: "Explore Roles", icon: GridIcon },
  { href: "/roadmap", label: "Roadmap", icon: RouteIcon },
  { href: "/courses", label: "Courses", icon: GraduationCapIcon, section: "courses" },
  { href: "/ideas", label: "Project Ideas", icon: LightbulbIcon, section: "ideas" },
  { href: "/research", label: "Research Papers", icon: FlaskIcon, section: "research" },
  { href: "/freelancing", label: "Freelancing", icon: BriefcaseIcon, section: "freelancing" },
  { href: "/certifications", label: "Certifications", icon: AwardIcon, section: "certifications" },
  { href: "/progress", label: "Progress", icon: CalendarIcon },
  { href: "/saved", label: "Saved", icon: BookmarkIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const CERTIFICATION_TIMESTAMPS = CERTIFICATIONS.map((c) => c.researchedAt);

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppState();
  const { ideas } = useIdeas();
  const { papers } = useResearch();
  const { gigs } = useFreelance();
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

  const { newCount: newCourses } = useNewBadge(
    "courses",
    courses.filter((c) => c.createdAt).map((c) => c.createdAt!)
  );
  const { newCount: newIdeas } = useNewBadge("ideas", ideas.map((i) => i.createdAt));
  const { newCount: newResearch } = useNewBadge("research", papers.map((p) => p.createdAt));
  const { newCount: newFreelance } = useNewBadge("freelancing", gigs.map((g) => g.createdAt));
  const { newCount: newCerts } = useNewBadge("certifications", CERTIFICATION_TIMESTAMPS);

  const newCounts: Record<NavSection, number> = {
    courses: newCourses,
    ideas: newIdeas,
    research: newResearch,
    freelancing: newFreelance,
    certifications: newCerts,
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 border-r border-[var(--border)] bg-[var(--surface)] h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-[var(--border)]">
        <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0" priority />
        <span className="flex-1 font-semibold tracking-tight">Career Hub</span>
        <NotificationBell />
      </div>

      <ProfileSwitcher />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, section }) => {
          const active = pathname.startsWith(href);
          const count = section ? newCounts[section] : 0;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
        >
          {theme === "dark" ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}
