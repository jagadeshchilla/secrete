import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import NotificationBell from "./NotificationBell";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="fixed right-4 top-3 z-40 rounded-full border border-[var(--border)] bg-[var(--surface)] shadow-sm md:hidden">
        <NotificationBell align="right" />
      </div>
      <main className="flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
