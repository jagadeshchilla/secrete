import Link from "next/link";
import { BrowserIcon, ExternalLinkIcon } from "@/components/icons";

function SectionHeading({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--good)] text-sm font-bold text-white">
        {n}
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
    >
      {children}
      <ExternalLinkIcon className="h-3 w-3" />
    </a>
  );
}

const ulCls = "mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted)]";
const pCls = "mt-2 text-sm leading-relaxed text-[var(--muted)]";

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
        <BrowserIcon className="h-3.5 w-3.5" />
        Portfolio
      </div>
      <h1 className="animate-fade-in-up mt-2 text-3xl font-bold leading-tight tracking-tight">
        Build a Personal Portfolio Website
      </h1>
      <p className="animate-fade-in-up mt-2 text-base leading-relaxed text-[var(--muted)]">
        One link that shows everything — your projects, skills, and story — on your own terms, instead of
        scattered across GitHub, LinkedIn, and a PDF resume.
      </p>

      <div className="animate-fade-in-up mt-8 space-y-10">
        <section>
          <SectionHeading n={1} title="Why you need one" />
          <p className={pCls}>
            A resume lists what you did. A portfolio shows it — live demos, real screenshots, and the reasoning
            behind your decisions. It&apos;s the one link you can drop in a job application, a cold email, or your
            LinkedIn bio that represents you fully, with full control over how it&apos;s presented.
          </p>
        </section>

        <section>
          <SectionHeading n={2} title="What to include" />
          <ul className={ulCls}>
            <li><strong className="text-[var(--text)]">Hero/intro</strong> — who you are and what you do, in one line.</li>
            <li><strong className="text-[var(--text)]">Projects</strong> — your 3-6 strongest, each with: live demo link, GitHub link, tech stack, your specific role, and the problem it solved.</li>
            <li><strong className="text-[var(--text)]">Skills</strong> — grouped by category (languages, frameworks, tools), not a wall of badges.</li>
            <li><strong className="text-[var(--text)]">Experience</strong> — short, outcome-focused entries, not a copy of your resume.</li>
            <li><strong className="text-[var(--text)]">Certifications</strong> — link to verifiable ones.</li>
            <li><strong className="text-[var(--text)]">Contact</strong> — email, LinkedIn, GitHub, and a downloadable resume PDF.</li>
          </ul>
        </section>

        <section>
          <SectionHeading n={3} title="How to build it fast" />
          <p className={pCls}>Two realistic paths:</p>
          <ul className={ulCls}>
            <li>
              <strong className="text-[var(--text)]">Code it yourself</strong> — Next.js/React + Tailwind CSS, using
              a component library to skip the UI-from-scratch work. See the{" "}
              <Link href="/blogs/frontend-ui" className="font-medium text-[var(--accent)] hover:underline">
                Frontend &amp; UI guide
              </Link>{" "}
              for component libraries, templates, and AI tools to speed this up. Best if you want full control and
              it doubles as a project to show off.
            </li>
            <li>
              <strong className="text-[var(--text)]">Use a portfolio builder</strong> — faster to launch, less
              customizable, but gets you online same day.
            </li>
          </ul>
        </section>

        <section>
          <SectionHeading n={4} title="Make it feel premium" />
          <ul className={ulCls}>
            <li>Consistent spacing, type hierarchy, and one accent color — not five competing styles.</li>
            <li>Real screenshots or short GIFs of each project working, not just a text description.</li>
            <li>Write projects as mini case studies: problem → approach → result, with numbers where you have them.</li>
            <li>Make sure it&apos;s fast and fully responsive — this is often the first thing judged, and a broken mobile layout undercuts everything else.</li>
            <li>Use a custom domain instead of the default subdomain — it reads as more intentional.</li>
          </ul>
        </section>

        <section>
          <SectionHeading n={5} title="Where to host for free" />
          <div className="mt-3 flex flex-wrap gap-2">
            <ExtLink href="https://vercel.com/">Vercel</ExtLink>
            <ExtLink href="https://www.netlify.com/">Netlify</ExtLink>
            <ExtLink href="https://pages.github.com/">GitHub Pages</ExtLink>
          </div>
          <p className={pCls}>
            All three deploy straight from a GitHub repo on every push — build once, and updates go live
            automatically.
          </p>
        </section>
      </div>
    </div>
  );
}
