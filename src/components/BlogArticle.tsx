import { ExternalLinkIcon } from "@/components/icons";

export interface BlogSection {
  title: string;
  description: string;
  link?: { label: string; url: string };
  links?: { label: string; url: string }[];
  prompt?: string;
}

export default function BlogArticle({
  icon: Icon,
  title,
  intro,
  sections,
}: {
  icon: typeof ExternalLinkIcon;
  title: string;
  intro: string;
  sections: BlogSection[];
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <Icon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">{intro}</p>

      {sections.length === 0 ? (
        <div className="mt-8 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
          Coming soon.
        </div>
      ) : (
        <article className="animate-fade-in-up mt-8 space-y-8">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-base font-semibold">
                {i + 1}. {section.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{section.description}</p>
              {section.link && (
                <a
                  href={section.link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  {section.link.label}
                </a>
              )}
              {section.links && section.links.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {section.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] hover:border-[var(--accent)] hover:underline"
                    >
                      <ExternalLinkIcon className="h-3 w-3" />
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
              {section.prompt && (
                <blockquote className="mt-2.5 border-l-2 border-[var(--accent)] bg-[var(--surface-2)] py-2 pl-3 text-sm italic leading-relaxed text-[var(--text)]">
                  &ldquo;{section.prompt}&rdquo;
                </blockquote>
              )}
            </section>
          ))}
        </article>
      )}
    </div>
  );
}
