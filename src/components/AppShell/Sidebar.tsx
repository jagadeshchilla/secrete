"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import ProfileSwitcher from "./ProfileSwitcher";
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
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/roles", label: "Explore Roles", icon: GridIcon },
  { href: "/roadmap", label: "Roadmap", icon: RouteIcon },
  { href: "/courses", label: "Courses", icon: GraduationCapIcon },
  { href: "/progress", label: "Progress", icon: CalendarIcon },
  { href: "/saved", label: "Saved", icon: BookmarkIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppState();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 border-r border-[var(--border)] bg-[var(--surface)] h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-[var(--border)]">
        <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0" priority />
        <span className="font-semibold tracking-tight">Career Hub</span>
      </div>

      <ProfileSwitcher />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
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
              {label}
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
