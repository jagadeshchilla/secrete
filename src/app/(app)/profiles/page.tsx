import { BadgeIcon, ExternalLinkIcon } from "@/components/icons";

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

export default function ProfilesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
        <BadgeIcon className="h-3.5 w-3.5" />
        Profiles
      </div>
      <h1 className="animate-fade-in-up mt-2 text-3xl font-bold leading-tight tracking-tight">
        Improve Your Professional Profiles
      </h1>
      <p className="animate-fade-in-up mt-2 text-base leading-relaxed text-[var(--muted)]">
        GitHub, LinkedIn, freelance platforms, and Kaggle — these are often the first things a recruiter or
        client checks. Here&apos;s how to make each one actually work for you.
      </p>

      <div className="animate-fade-in-up mt-8 space-y-10">
        <section>
          <SectionHeading n={1} title="GitHub" />
          <p className={pCls}>
            Your GitHub is a portfolio, not a junk drawer. A recruiter who clicks through should immediately see
            what you can build.
          </p>
          <ul className={ulCls}>
            <li>Pin your 4-6 best repos — ones with a clear purpose, clean code, and a working demo or screenshots.</li>
            <li>Add a profile README (a repo named exactly your username) with a short intro, skills, and links to your best work.</li>
            <li>Every pinned repo needs a proper README: what it does, tech stack, how to run it, and a screenshot/GIF.</li>
            <li>Keep your contribution graph active — consistent small commits read better than one huge dump.</li>
            <li>Write real commit messages (&ldquo;Fix race condition in queue consumer&rdquo;, not &ldquo;update&rdquo;).</li>
            <li>Use topics/tags on repos so they&apos;re searchable and show your stack at a glance.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <ExtLink href="https://github.com/">github.com</ExtLink>
            <ExtLink href="https://readme.so/">readme.so (README builder)</ExtLink>
            <ExtLink href="https://github.com/anuraghazra/github-readme-stats">github-readme-stats</ExtLink>
          </div>
        </section>

        <section>
          <SectionHeading n={2} title="LinkedIn" />
          <p className={pCls}>
            LinkedIn is where recruiters actually search. An optimized profile shows up more and converts
            better once someone lands on it.
          </p>
          <ul className={ulCls}>
            <li>Use a clear, professional headshot — profiles with a photo get far more views.</li>
            <li>Write a headline that says what you do and for whom, not just your job title (e.g. &ldquo;AI Engineer — building RAG pipelines and data products&rdquo;).</li>
            <li>The About section should read like a short story: what you work on, what you&apos;re good at, what you&apos;re looking for — written in first person, not a bullet-point resume dump.</li>
            <li>Use the Featured section to pin your best projects, articles, or certifications.</li>
            <li>List real skills and get a few endorsements/recommendations from people you&apos;ve actually worked with.</li>
            <li>Post or comment occasionally — activity keeps you visible in your network&apos;s feed and in search.</li>
            <li>Turn on &ldquo;Open to Work&rdquo; (visible to recruiters only) when you&apos;re actively job hunting.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <ExtLink href="https://www.linkedin.com/">linkedin.com</ExtLink>
          </div>
        </section>

        <section>
          <SectionHeading n={3} title="Freelance platforms" />
          <p className={pCls}>
            On Upwork, Fiverr, or similar, your profile has to convert cold visitors into clients within a few
            seconds.
          </p>
          <ul className={ulCls}>
            <li>Use a specific, niche title instead of a generic one (&ldquo;RAG pipeline &amp; LLM integration developer&rdquo; beats &ldquo;Software Developer&rdquo;).</li>
            <li>Lead your overview with the client&apos;s problem and how you solve it, not your life story.</li>
            <li>Add portfolio samples with real outcomes — even personal projects count if they&apos;re well-presented.</li>
            <li>Your first few reviews matter disproportionately — consider slightly lower rates initially to build a track record.</li>
            <li>Respond fast and clearly — platforms rank responsive freelancers higher.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <ExtLink href="https://www.upwork.com/">upwork.com</ExtLink>
            <ExtLink href="https://www.fiverr.com/">fiverr.com</ExtLink>
          </div>
        </section>

        <section>
          <SectionHeading n={4} title="Kaggle" />
          <p className={pCls}>
            For data/ML roles, Kaggle shows you can actually apply what you know — not just talk about it.
          </p>
          <ul className={ulCls}>
            <li>Complete your profile (bio, links, location) — incomplete profiles look abandoned.</li>
            <li>Join competitions even if you won&apos;t win — a documented attempt shows initiative and process.</li>
            <li>Publish well-documented notebooks: clear EDA, reasoning behind choices, and readable code — not just output cells.</li>
            <li>Comment and engage on others&apos; notebooks/discussions — it builds visibility and your Kaggle tier.</li>
            <li>Link your best notebooks from your resume, LinkedIn, and portfolio.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <ExtLink href="https://www.kaggle.com/">kaggle.com</ExtLink>
          </div>
        </section>

        <section>
          <SectionHeading n={5} title="Stack Overflow" />
          <p className={pCls}>
            Reputation here is hard to fake — it shows you can actually solve other people&apos;s real problems,
            which carries more weight with technical interviewers than almost anything else on this list.
          </p>
          <ul className={ulCls}>
            <li>Answer questions in your actual area of strength — a handful of thorough, well-explained answers beats dozens of one-liners.</li>
            <li>Include working code and explain *why* the fix works, not just the fix itself.</li>
            <li>Ask good questions too when you&apos;re stuck — a well-formed question with a minimal reproducible example gets upvoted and helps others later.</li>
            <li>Link your Stack Overflow profile from your portfolio/resume once you have a reasonable reputation.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <ExtLink href="https://stackoverflow.com/">stackoverflow.com</ExtLink>
          </div>
        </section>

        <section>
          <SectionHeading n={6} title="LeetCode / HackerRank" />
          <p className={pCls}>
            Interviewers often check these before a call. A thin or inactive profile can quietly work against you
            even if your resume is strong.
          </p>
          <ul className={ulCls}>
            <li>Consistency beats cramming — solving a few problems a week steadily builds both skill and a visible streak.</li>
            <li>Cover the common patterns (two pointers, sliding window, BFS/DFS, DP) rather than only grinding random problems.</li>
            <li>Keep your profile public and complete — company, education, and a link to GitHub/LinkedIn.</li>
            <li>On LeetCode specifically, contest ratings and a solid solved count are the two numbers people glance at first.</li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <ExtLink href="https://leetcode.com/">leetcode.com</ExtLink>
            <ExtLink href="https://www.hackerrank.com/">hackerrank.com</ExtLink>
          </div>
        </section>
      </div>
    </div>
  );
}
