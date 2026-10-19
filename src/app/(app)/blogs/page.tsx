import Link from "next/link";
import { BookIcon, LayersIcon, ChevronRightIcon } from "@/components/icons";

interface BlogEntry {
  title: string;
  excerpt: string;
  tag: string;
  href?: string; // omitted = coming soon, not yet linked
  icon: typeof BookIcon;
}

const BLOGS: BlogEntry[] = [
  {
    title: "Frontend & UI",
    excerpt: "Where to find good UI inspiration, component libraries worth building with, and how to improve your frontend using AI.",
    tag: "Frontend",
    href: "/blogs/frontend-ui",
    icon: LayersIcon,
  },
];

export default function BlogsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <BookIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Blogs</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Shared write-ups and guides — more topics get added here over time.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BLOGS.map((blog) => {
          const Icon = blog.icon;
          const content = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--good)] text-white">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="shrink-0 border border-[var(--accent)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                  {blog.tag}
                </span>
              </div>
              <h2 className="mt-2 text-sm font-semibold leading-snug">{blog.title}</h2>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">{blog.excerpt}</p>
              <div className="mt-auto flex items-center justify-between pt-2 text-[11px] font-medium">
                {blog.href ? (
                  <>
                    <span className="text-[var(--accent)]">Read</span>
                    <ChevronRightIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
                  </>
                ) : (
                  <span className="text-[var(--muted)]">Coming soon</span>
                )}
              </div>
            </>
          );

          return blog.href ? (
            <Link
              key={blog.title}
              href={blog.href}
              className="card-hover animate-fade-in-up flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]"
            >
              {content}
            </Link>
          ) : (
            <div
              key={blog.title}
              className="animate-fade-in-up flex flex-col rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 opacity-60"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
