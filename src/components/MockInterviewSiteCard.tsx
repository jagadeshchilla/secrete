import { ExternalLinkIcon } from "@/components/icons";
import Favicon from "@/components/Favicon";

export interface MockInterviewSite {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
}

export default function MockInterviewSiteCard({ site }: { site: MockInterviewSite }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noreferrer"
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 hover:border-[var(--accent)]"
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
          <Favicon url={site.url} className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold leading-snug">{site.title}</h3>
          <p className="truncate text-[10px] text-[var(--muted)]">{site.category}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{site.description}</p>
      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)]">
        Visit site
        <ExternalLinkIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </a>
  );
}
