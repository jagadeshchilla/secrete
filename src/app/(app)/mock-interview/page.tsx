import { MessageIcon } from "@/components/icons";
import MockInterviewSiteCard, { type MockInterviewSite } from "@/components/MockInterviewSiteCard";
import SITES from "@/data/mockInterviewSites.json";

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

export default function MockInterviewPage() {
  const sites = SITES as MockInterviewSite[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-2">
        <MessageIcon className="h-5 w-5 text-[var(--accent)]" />
        <h1 className="text-2xl font-semibold tracking-tight">Mock Interview</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Two ways to practice before the real thing — a dedicated AI mock-interview website, or a two-way
        conversation with an LLM like ChatGPT or Claude acting as your interviewer.
      </p>

      <div className="animate-fade-in-up mt-8 space-y-10">
        <section>
          <SectionHeading n={1} title="AI mock-interview websites" />
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Dedicated platforms built specifically for interview practice — usually with voice or chat-based AI
            interviewers, role-specific question banks, and feedback on your answers.
          </p>

          {sites.length === 0 ? (
            <div className="mt-4 border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
              No sites added yet.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sites.map((s) => (
                <MockInterviewSiteCard key={s.id} site={s} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeading n={2} title="Practice directly with an LLM" />
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            No dedicated app needed — ChatGPT, Claude, or any other chat-based LLM can run a full two-way mock
            interview if you set it up with the right prompt. Paste your target role (and your resume, if you want
            it tailored) and ask it to conduct the interview turn by turn, one question at a time, not all at once.
          </p>
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-sm italic leading-relaxed text-[var(--text)]">
              <span className="mr-1 font-serif text-lg text-[var(--accent)]">&ldquo;</span>
              Act as my interviewer for a [role] position. Ask me one interview question at a time — behavioral and
              technical — and wait for my answer before asking the next one. After each answer, briefly critique it
              (what was good, what was missing, how to make it stronger) before moving on. Start with an
              introduction question. Here is my resume/background for context: [paste resume or summary].
              <span className="font-serif text-lg text-[var(--accent)]">&rdquo;</span>
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            This keeps it a real back-and-forth conversation instead of a one-shot Q&amp;A dump — closer to an
            actual interview, and you get feedback after every answer instead of only at the end.
          </p>
        </section>
      </div>
    </div>
  );
}
