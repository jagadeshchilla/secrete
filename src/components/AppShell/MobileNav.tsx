"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  GridIcon,
  CalendarIcon,
  BookmarkIcon,
  SettingsIcon,
  RouteIcon,
  GraduationCapIcon,
  LightbulbIcon,
  FlaskIcon,
  BriefcaseIcon,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/roles", label: "Roles", icon: GridIcon },
  { href: "/roadmap", label: "Roadmap", icon: RouteIcon },
  { href: "/courses", label: "Courses", icon: GraduationCapIcon },
  { href: "/ideas", label: "Ideas", icon: LightbulbIcon },
  { href: "/research", label: "Research", icon: FlaskIcon },
  { href: "/freelancing", label: "Freelance", icon: BriefcaseIcon },
  { href: "/progress", label: "Progress", icon: CalendarIcon },
  { href: "/saved", label: "Saved", icon: BookmarkIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch overflow-x-auto border-t border-[var(--border)] bg-[var(--surface)]">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-w-[64px] shrink-0 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
              active ? "text-[var(--accent)]" : "text-[var(--muted)]"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
