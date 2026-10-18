import Image from "next/image";
import { FileTextIcon, ExternalLinkIcon } from "@/components/icons";

interface ResumeStep {
  title: string;
  description: string;
  link?: { label: string; url: string };
  image?: { src: string; alt: string };
  prompt?: string;
}

const STEPS: ResumeStep[] = [
  {
    title: "Open the Overleaf template",
    description:
      "We use this minimal CV template as the starting point for every resume — clean layout, easy to edit, no design work needed.",
    link: { label: "Minimal CV Template — Overleaf", url: "https://www.overleaf.com/latex/templates/minimal-cv-template/hnvkvrchysmg" },
  },
  {
    title: "Click \"View Source\"",
    description: "On the template page, click View Source (next to Open as Template) instead of opening it directly.",
    image: { src: "/resume-creation/view-source-button.png", alt: "The View Source button on the Overleaf template page" },
  },
  {
    title: "Copy the LaTeX code",
    description: "A popup opens showing the full LaTeX source of the template. Select and copy all of it.",
    image: { src: "/resume-creation/latex-source-popup.png", alt: "The LaTeX source code popup on Overleaf" },
  },
  {
    title: "Paste it into ChatGPT with your details",
    description:
      "Paste the LaTeX code into ChatGPT along with your own details — qualifications, experience, skills — or just paste your old CV and let it pull the details from there. Use a prompt like this:",
    prompt:
      "Below is the LaTeX source code of my resume template, followed by my details (or my old CV). Rewrite the LaTeX code with my information filled in, keeping the exact same structure, formatting, and commands as the template — don't change the layout or packages. Rephrase my experience and project bullet points to be concise, achievement-focused, and ATS-friendly, using strong action verbs and quantifying results wherever possible. If anything important seems missing (dates, metrics, tech stack, etc.), ask me before filling it in with placeholders. Output only the final, complete, compilable LaTeX code — no explanations before or after.",
  },
  {
    title: "Open as Template and paste the code",
    description:
      "Go back to the template page, but this time click Open as Template. This opens the Overleaf editor — a code panel on the left and a live PDF preview on the right. Select everything in the code panel and paste in the code ChatGPT gave you.",
    image: { src: "/resume-creation/paste-code-editor.png", alt: "The Overleaf editor with the code panel and PDF preview" },
  },
  {
    title: "Compile it",
    description: "Click Recompile at the top. Your resume renders in the preview on the right.",
    image: { src: "/resume-creation/recompile-button.png", alt: "The Recompile button in the Overleaf editor" },
  },
  {
    title: "Fix issues and repeat until it's right",
    description:
      "Check the preview. If something's off — spacing, overflow, wording, anything — tell ChatGPT exactly what's wrong and ask for the corrected code. Paste the new code back into the editor and recompile. Keep repeating this loop until the resume looks exactly right, then download it as a PDF.",
  },
  {
    title: "Score it on Resume Worded",
    description:
      "Upload the PDF to Resume Worded to see how it scores. If the score is low, ask ChatGPT to fix whatever it flagged as lacking, update the code, paste it back into Overleaf, recompile, download again, and re-check the score. Keep looping until you're happy with the score.",
    link: { label: "Resume Worded", url: "https://resumeworded.com/" },
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

      <article className="animate-fade-in-up mt-8 space-y-8">
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
            {step.prompt && (
              <blockquote className="mt-2.5 border-l-2 border-[var(--accent)] bg-[var(--surface-2)] py-2 pl-3 text-sm italic leading-relaxed text-[var(--text)]">
                &ldquo;{step.prompt}&rdquo;
              </blockquote>
            )}
            {step.image && (
              <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
                <Image
                  src={step.image.src}
                  alt={step.image.alt}
                  width={1280}
                  height={720}
                  className="w-full"
                  sizes="(max-width: 768px) 100vw, 640px"
                />
              </div>
            )}
          </section>
        ))}

        <div className="flex items-start gap-2.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] p-4">
          <span className="text-xl leading-none">😊</span>
          <p className="text-sm font-medium text-[var(--text)]">
            Your resume is done! I hope it&apos;s helpful to you.
          </p>
        </div>
      </article>
    </div>
  );
}
