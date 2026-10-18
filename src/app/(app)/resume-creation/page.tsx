import { FileTextIcon, ExternalLinkIcon } from "@/components/icons";

interface ResumeStep {
  title: string;
  description: string;
  link?: { label: string; url: string };
}

const STEPS: ResumeStep[] = [
  {
    title: "Open the Overleaf template",
    description:
      "We use this minimal CV template as the starting point for every resume — clean layout, easy to edit, no design work needed.",
    link: { label: "Minimal CV Template — Overleaf", url: "https://www.overleaf.com/latex/templates/minimal-cv-template/hnvkvrchysmg" },
  },
];

export default function ResumeCreationPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <FileTextIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Resume Creation</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        How to put together a resume fast, using ChatGPT and Overleaf — follow the steps in order.
      </p>

      <article className="animate-fade-in-up mt-8 space-y-6">
        {STEPS.map((step, i) => (
          <section key={i}>
            <h2 className="text-base font-semibold">
              {i + 1}. {step.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{step.description}</p>
            {step.link && (
              <a
                href={step.link.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                {step.link.label}
              </a>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
