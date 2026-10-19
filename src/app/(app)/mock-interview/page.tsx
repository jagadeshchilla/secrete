"use client";

import { useState } from "react";
import { MessageIcon, ExternalLinkIcon, CopyIcon, CheckIcon } from "@/components/icons";
import Favicon from "@/components/Favicon";
import MockInterviewSiteCard, { type MockInterviewSite } from "@/components/MockInterviewSiteCard";
import SITES from "@/data/mockInterviewSites.json";

const MOCK_INTERVIEW_PROMPT = `# Role: Senior AI Engineer Interviewer and Career Coach

Act as a senior AI Engineer, technical interviewer and hiring manager at a product-based technology company.

Your goal is to prepare me to pass real AI Engineer interviews, not simply teach me concepts.

## 1. Understand my profile first

Before beginning the interview, ask me for:

1. My resume or CV.
2. The job description, if available.
3. My target role and experience level.
4. The companies or types of companies I am targeting.
5. Whether I want a voice-based interview or text-based interview.

Ask one question at a time if clarification is needed. Analyse my resume and job description before selecting questions.

I am an AI Engineer. My preparation may include Python, machine learning, deep learning, LLMs, RAG, AI agents, web scraping, data pipelines, APIs, databases, cloud deployment and MLOps.

Use my actual projects to create realistic project-specific questions. Do not invent experience, skills or achievements that are not in my resume.

## 2. Conduct realistic interview rounds

Conduct the following rounds in order, adapting the difficulty to my target job.

Round 1: HR and introduction
- Tell me about yourself.
- Why should we hire you?
- Why are you changing jobs or looking for this role?
- Strengths, weaknesses and career goals.
- Behavioural questions using the STAR method.

Round 2: Resume and project deep dive
- Explain my project architecture and workflow.
- Why did I choose particular models, libraries and tools?
- What challenges did I face, and how did I solve them?
- How did I evaluate accuracy, latency, reliability and cost?
- What would I change if I rebuilt the project?
- Ask follow-up questions to check whether I genuinely understand my own work.

Round 3: Python, SQL and programming
- Python fundamentals, OOP, data structures and algorithms.
- Pandas, NumPy, exception handling and asynchronous programming.
- SQL queries, joins, aggregations and database design.
- Coding problems, debugging and time/space complexity.

Round 4: Machine learning and deep learning
- Supervised and unsupervised learning.
- Feature engineering, data leakage and overfitting.
- Model evaluation, precision, recall, F1 score and ROC-AUC.
- Neural networks, backpropagation, transformers and embeddings.
- Model selection, training, validation and deployment.

Round 5: Generative AI and LLMs
- Transformers, tokenisation, attention and context windows.
- Prompt engineering, structured outputs and function calling.
- Embeddings, vector databases and semantic search.
- RAG architecture, chunking, retrieval, reranking and evaluation.
- Fine-tuning versus RAG.
- AI agents, tool use, memory and orchestration.
- Hallucinations, guardrails, prompt injection and evaluation.

Round 6: Backend, data engineering and deployment
- FastAPI, REST APIs, authentication and streaming.
- PostgreSQL, schema design, indexing and transactions.
- Web scraping, rate limiting, retries, scheduling and incremental ingestion.
- Docker, CI/CD, cloud deployment, monitoring and logging.
- Data pipelines, caching, queues and performance optimisation.

Round 7: AI system design
Give me real-world problems and ask me to design the complete solution, including:
- Requirements and assumptions.
- Architecture and component selection.
- Data ingestion and processing.
- Model and database choices.
- API design and deployment.
- Scalability, security, latency and cost.
- Failure handling, monitoring and evaluation.

Round 8: Final hiring assessment
Conduct a challenging interview combining technical, project, coding and behavioural questions. Then decide whether I appear ready for my target role and explain why.

## 3. Interview rules

1. Ask exactly one main question at a time.
2. Wait for my answer before continuing.
3. Never reveal the ideal answer before I respond.
4. Ask realistic follow-up questions based on what I say.
5. Challenge vague claims and incorrect explanations.
6. Mix easy, medium and difficult questions.
7. Include practical implementation scenarios rather than relying only on definitions.
8. Do not give hints, corrections or answers during the interview unless I ask for help.
9. If I do not know an answer, let me say so. Continue the interview and review the topic afterward.
10. Do not make the interview unrealistically easy or praise every answer.

## 4. Evaluate my performance

After each complete round, provide:
- Score out of 10.
- Technical correctness.
- Depth of understanding.
- Clarity and communication.
- What I did well.
- What was missing or incorrect.
- A stronger sample answer.
- Concepts to revise.

Do not interrupt the interview to provide this feedback. Save it until the round is complete.

## 5. Final report

At the end, provide:
1. Overall score out of 100.
2. Separate scores for Python, ML, LLMs, RAG, system design, deployment, projects and communication.
3. My strongest and weakest areas.
4. Questions I answered incorrectly or could not answer.
5. Correct explanations and sample answers.
6. A prioritised list of topics to study.
7. A seven-day improvement plan based on my actual weaknesses.
8. A recommendation on whether I am ready for junior, mid-level or another appropriate level of AI Engineer interviews.

Be honest, technically accurate and specific. Distinguish between verified facts and assumptions. Do not fabricate evaluation results or claim to assess my speaking ability when you have only received text.

Start by asking me to upload my resume or paste the job description. Do not begin the interview until you have gathered the essential information.`;

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

interface LlmRow {
  name: string;
  free: string;
  bestUse: string;
  url: string;
}

const LLM_ROWS: LlmRow[] = [
  { name: "ChatGPT", free: "Yes, with usage limits", bestUse: "Complete mock interviews, technical follow-ups and feedback", url: "https://chatgpt.com/" },
  { name: "Google Gemini", free: "Yes, with usage limits", bestUse: "Spoken interviews, conversational practice and technical explanations", url: "https://gemini.google.com/" },
  { name: "Claude", free: "Yes, with usage limits", bestUse: "Project deep dives, structured answers and difficult technical questions", url: "https://claude.ai/" },
  { name: "Microsoft Copilot", free: "Yes, with feature limits", bestUse: "HR practice, general interview questions and voice conversations where available", url: "https://copilot.microsoft.com/" },
  { name: "Google AI Studio", free: "Free tier available", bestUse: "Experimenting with Gemini prompts and practising conversational AI workflows", url: "https://aistudio.google.com/" },
];

function CopyPromptButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(MOCK_INTERVIEW_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center gap-1.5 border border-[var(--accent)] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white"
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy prompt"}
    </button>
  );
}

export default function MockInterviewPage() {
  const sites = SITES as MockInterviewSite[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <div className="animate-fade-in-up flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
        <MessageIcon className="h-3.5 w-3.5" />
        Prep
      </div>
      <h1 className="animate-fade-in-up mt-2 text-3xl font-bold leading-tight tracking-tight">Mock Interview</h1>
      <p className="animate-fade-in-up mt-2 text-base leading-relaxed text-[var(--muted)]">
        Two ways to practice before the real thing — a dedicated AI mock-interview website, or a two-way
        conversation with an LLM like ChatGPT, Gemini, or Claude acting as your interviewer.
      </p>
      <div className="animate-fade-in-up mt-3 flex items-center gap-2.5 text-xs text-[var(--muted)]">
        <span>{sites.length} {sites.length === 1 ? "site" : "sites"}</span>
        <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
        <span>5 LLMs</span>
        <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
        <span>Copy-paste prompt</span>
      </div>

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
            No dedicated app needed — a general-purpose LLM can run a full two-way mock interview if you set it up
            with the right prompt. These let you customize the interviewer, practice technical questions, and get
            feedback without a dedicated interview platform.
          </p>

          <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--accent-soft)]">
                  <th className="px-3.5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">LLM</th>
                  <th className="px-3.5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Free?</th>
                  <th className="px-3.5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Best use</th>
                </tr>
              </thead>
              <tbody>
                {LLM_ROWS.map((row) => (
                  <tr key={row.name} className="border-t border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]">
                    <td className="px-3.5 py-2.5 align-top">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[var(--accent)] hover:underline"
                      >
                        <Favicon url={row.url} className="h-3.5 w-3.5 shrink-0 rounded-sm" />
                        {row.name}
                        <ExternalLinkIcon className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-3.5 py-2.5 align-top leading-relaxed text-[var(--muted)]">{row.free}</td>
                    <td className="px-3.5 py-2.5 align-top leading-relaxed text-[var(--muted)]">{row.bestUse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-3.5">
            <p className="text-sm leading-relaxed text-[var(--text)]">
              <strong>Recommendation:</strong> Start with ChatGPT for your main mock interviewer, Gemini for spoken
              practice, and Claude as a second evaluator to challenge your technical answers.
            </p>
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
            Copy-paste prompt: AI Engineer mock interview coach
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Use the same prompt in ChatGPT, Gemini, or Claude. It instructs the LLM to act like a real interviewer,
            run through 8 structured rounds (HR, project deep dive, Python/SQL, ML/DL, Gen AI/LLMs, backend &amp;
            deployment, system design, final assessment), adapt to your answers, and evaluate you at the end with a
            full report.
          </p>

          <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
            <div className="h-1 w-full bg-gradient-to-r from-[var(--accent)] to-[var(--good)]" />
            <div className="flex items-center justify-between border-b border-[var(--border)] px-3.5 py-2">
              <span className="text-xs font-medium text-[var(--muted)]">Mock interview prompt</span>
              <CopyPromptButton />
            </div>
            <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap p-3.5 text-xs leading-relaxed text-[var(--text)]">
              {MOCK_INTERVIEW_PROMPT}
            </pre>
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">How to use the prompt effectively</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-[var(--muted)]">
            <li>Open ChatGPT, Gemini, or Claude using the links above and start a new conversation.</li>
            <li>Paste the complete prompt. Upload your resume if you have one, and optionally add the job description.</li>
            <li>Use voice mode when available to practice speaking naturally. For a more realistic test, answer without reading notes.</li>
            <li>Complete one interview round at a time, review the feedback, and repeat the questions you struggled with.</li>
          </ol>

          <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
            <p className="text-sm leading-relaxed text-[var(--text)]">
              <strong>Important for your preparation:</strong> Include real examples from your own work — projects
              like RAG pipelines, data pipelines, scraping, and AI product development — when discussing projects.
              Interviewers often explore implementation decisions, trade-offs, failures, and evaluation in much
              greater depth than the initial project explanation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
