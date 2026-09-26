import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "@/components/icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#12100a] text-[#f3ede1]">
      <header className="flex h-16 items-center justify-between border-b border-[#2a2418] px-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-wide text-[#f2c368]">Admin</span>
          <span className="hidden text-xs text-[#9a927e] sm:inline">
            Content management — separate from the main app
          </span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 border border-[#2a2418] px-3 py-1.5 text-xs font-medium text-[#c9c0ac] hover:border-[#f2c368] hover:text-[#f2c368]"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to app
        </Link>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
