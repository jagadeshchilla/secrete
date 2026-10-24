import { TargetIcon, ExternalLinkIcon } from "@/components/icons";

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
const olCls = "mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted)]";
const pCls = "mt-2 text-sm leading-relaxed text-[var(--muted)]";

export default function JobApplicationsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
        <TargetIcon className="h-3.5 w-3.5" />
        Jobs
      </div>
      <h1 className="animate-fade-in-up mt-2 text-3xl font-bold leading-tight tracking-tight">
        Finding Jobs and Applying Well
      </h1>
      <p className="animate-fade-in-up mt-2 text-base leading-relaxed text-[var(--muted)]">
        Where to actually find roles, and how to apply in a way that gets read instead of auto-filtered out.
      </p>

      <div className="mt-8 space-y-10">
        <section className="animate-fade-in-up" style={{ animationDelay: "40ms" }}>
          <SectionHeading n={1} title="Where to find jobs" />
          <p className={pCls}>Spread your search across a few different sources instead of relying on one:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ExtLink href="https://www.linkedin.com/jobs/">LinkedIn Jobs</ExtLink>
            <ExtLink href="https://www.indeed.com/">Indeed</ExtLink>
            <ExtLink href="https://wellfound.com/">Wellfound (startups)</ExtLink>
            <ExtLink href="https://www.ycombinator.com/jobs">YC Jobs</ExtLink>
            <ExtLink href="https://www.glassdoor.com/">Glassdoor</ExtLink>
            <ExtLink href="https://www.naukri.com/">Naukri</ExtLink>
          </div>
          <p className={pCls}>
            Also check company career pages directly for roles you&apos;re genuinely excited about — some never
            get posted to job boards at all. And don&apos;t skip your network: a referral gets your application
            seen by a human far more often than a cold application does.
          </p>
        </section>

        <section className="animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <SectionHeading n={2} title="Before you apply" />
          <ul className={ulCls}>
            <li>Read the job description fully — tailor your resume&apos;s keywords and top bullet points to match it, since many companies filter resumes by keyword before a human sees them.</li>
            <li>Check if you meet most (not all) of the requirements — don&apos;t self-reject over a wishlist.</li>
            <li>Research the company: what they build, recent news, their tech stack — enough for one specific sentence in your application.</li>
          </ul>
        </section>

        <section className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <SectionHeading n={3} title="How to apply well" />
          <ol className={olCls}>
            <li>Use a role-specific resume, not one generic version for every application.</li>
            <li>If there&apos;s a cover letter or message field, write 3-4 sentences: why this role, one relevant achievement with a number, why this company specifically. Skip the generic &ldquo;I am writing to express my interest.&rdquo;</li>
            <li>Attach your portfolio and LinkedIn — make it effortless for them to see more.</li>
            <li>Apply within the first few days of a posting — early applicants get more attention before the pile builds up.</li>
            <li>If you know someone at the company, ask for a referral before or right after applying.</li>
          </ol>
        </section>

        <section className="animate-fade-in-up" style={{ animationDelay: "160ms" }}>
          <SectionHeading n={4} title="Track and follow up" />
          <ul className={ulCls}>
            <li>Keep a simple tracker: company, role, date applied, status, and any contact name — it&apos;s easy to lose track past 10-15 applications.</li>
            <li>Follow up once, about a week after applying, with a short polite note — it shows genuine interest and sometimes surfaces a stalled application.</li>
            <li>After interviews, send a brief thank-you note referencing something specific from the conversation.</li>
            <li>Track rejections too — if you&apos;re consistently getting rejected after a specific stage (resume screen, first call, technical round), that stage is where to focus your prep next.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
