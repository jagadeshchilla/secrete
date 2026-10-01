// A fixed, generic 3-step mini learning path applied to every topic/tool in
// the app (course checklist items and the flat tool catalog). These are
// deliberately generic process steps, not fabricated topic-specific facts —
// same honesty stance as using search links instead of guessed-at specific
// videos/articles/pages.
export interface ResourceLink {
  type: "youtube" | "article" | "docs";
  label: string;
  url: (topic: string) => string;
}

export interface Substep {
  key: string;
  label: string;
  reason: (topic: string) => string;
  resources: ResourceLink[];
  prompt: (topic: string) => string;
}

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function googleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export const SUBSTEPS: Substep[] = [
  {
    key: "overview",
    label: "Overview & fundamentals",
    reason: (t) => `Understand what ${t} is and why it's used before touching commands or configuration.`,
    resources: [
      { type: "youtube", label: "Video", url: (t) => youtubeSearchUrl(`${t} explained for beginners`) },
      { type: "article", label: "Article", url: (t) => googleSearchUrl(`${t} introduction guide`) },
      { type: "docs", label: "Docs", url: (t) => googleSearchUrl(`${t} official documentation`) },
    ],
    prompt: (t) =>
      `Explain ${t} to me: what it is, why it's used, and the key concepts I need to understand before going further. Keep it practical and beginner-friendly.`,
  },
  {
    key: "practice",
    label: "Hands-on practice",
    reason: (t) => `Hands-on practice cements ${t} far better than reading alone.`,
    resources: [
      { type: "youtube", label: "Video", url: (t) => youtubeSearchUrl(`${t} hands-on tutorial`) },
      { type: "article", label: "Article", url: (t) => googleSearchUrl(`${t} tutorial step by step`) },
      { type: "docs", label: "Docs", url: (t) => googleSearchUrl(`${t} getting started guide`) },
    ],
    prompt: (t) =>
      `Give me a hands-on, step-by-step exercise to practice ${t} so I can apply what I've learned, not just read about it.`,
  },
  {
    key: "review",
    label: "Common questions & deep dive",
    reason: (t) => `Knowing the gotchas and FAQs for ${t} prevents common mistakes and preps you for real-world use or interviews.`,
    resources: [
      { type: "youtube", label: "Video", url: (t) => youtubeSearchUrl(`${t} interview questions`) },
      { type: "article", label: "Article", url: (t) => googleSearchUrl(`${t} common mistakes best practices`) },
      { type: "docs", label: "Docs", url: (t) => googleSearchUrl(`${t} FAQ troubleshooting`) },
    ],
    prompt: (t) =>
      `What are the most important things to know about ${t} for interviews or real-world use, common mistakes to avoid, and questions I should be able to answer confidently?`,
  },
];

export function wholeTopicPrompt(topic: string) {
  return `Teach me ${topic} from scratch. Start with what it is and why it's used, then give me a step-by-step hands-on learning path covering the core concepts, the most common real-world use cases, and a small practice project I can build to test what I've learned. Explain it like I'm a beginner, but keep it practical rather than just theory.`;
}
