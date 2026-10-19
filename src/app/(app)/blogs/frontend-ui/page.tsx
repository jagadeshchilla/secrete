import Link from "next/link";
import { ArrowLeftIcon, LayersIcon } from "@/components/icons";
import BlogArticle, { type BlogSection } from "@/components/BlogArticle";

const SECTIONS: BlogSection[] = [
  {
    title: "Know where to start before you build",
    description:
      "Before writing any code, figure out what you're building and find a reference — a website or template close to what you want. You don't have to design from scratch, whether you're building with AI or by hand. Pick a reference first, then start from there.",
  },
  {
    title: "UI components and ready-made elements",
    description:
      "Use these when you want to copy existing components instead of building everything from scratch — buttons, forms, dialogs, dropdowns, sidebars, tables, and other application foundations.",
    links: [
      { label: "shadcn/ui", url: "https://ui.shadcn.com/" },
      { label: "21st.dev", url: "https://21st.dev/" },
      { label: "Uiverse", url: "https://uiverse.io/" },
      { label: "Flowbite", url: "https://flowbite.com/" },
      { label: "Preline UI", url: "https://preline.co/" },
      { label: "HyperUI", url: "https://www.hyperui.dev/" },
    ],
  },
  {
    title: "Animations and premium visual effects",
    description:
      "Use these to make a site feel more polished, interactive, and modern — text effects, interactive backgrounds, motion components, spotlight and parallax effects.",
    links: [
      { label: "React Bits", url: "https://www.reactbits.dev/" },
      { label: "Magic UI", url: "https://magicui.design/" },
      { label: "Aceternity UI", url: "https://ui.aceternity.com/" },
      { label: "Untitled UI", url: "https://www.untitledui.com/" },
    ],
  },
  {
    title: "Dashboards, charts, and analytics",
    description:
      "Particularly relevant for market research, trend analysis, and reporting modules — KPI cards, charts, data visualizations, and admin layouts.",
    links: [
      { label: "Tremor", url: "https://www.tremor.so/" },
      { label: "AdminLTE", url: "https://adminlte.io/" },
    ],
  },
  {
    title: "Complete website templates",
    description:
      "Use these when you want a starting point for an entire website or multiple pages, rather than individual components — full SaaS landing pages, dashboards, and website themes.",
    links: [
      { label: "Cruip", url: "https://cruip.com/" },
      { label: "Tailwind Awesome", url: "https://www.tailwindawesome.com/" },
      { label: "ThemeForest", url: "https://themeforest.net/" },
    ],
  },
  {
    title: "UI inspiration and design references",
    description:
      "Mainly for browsing, not copying — real SaaS product interfaces for ideas on dashboard layouts, navigation, onboarding, and application workflows.",
    links: [{ label: "SaaSFrame", url: "https://saasframe.io/" }],
  },
  {
    title: "Which ones to actually start with",
    description:
      "You don't need all of these installed in one project — just browse for ideas and pick what fits. If you want a shortlist: shadcn/ui for the actual application UI (the foundation), 21st.dev for alternative designs of components and page sections, Tremor for metrics and analytics visualizations, React Bits for carefully-picked animations, Uiverse for small details like buttons and hover effects, and Cruip for full landing page templates. One catch — \"free\" doesn't always mean every template or feature is free, so check pricing, license, and framework compatibility before committing to one.",
  },
  {
    title: "Swap out components as you go",
    description:
      "Partway through, you'll often want a different look for a component than what you started with. Reuse what's already out there instead of building it from zero — copy the component's code from a reference site, then either hand it to AI to adapt to your needs, or adjust it manually yourself.",
  },
  {
    title: "Mix and match if you have an eye for it",
    description:
      "If you've got a sense for design, don't feel locked into one reference site. Pull individual components you like from different sites and combine them into your own layout.",
  },
];

export default function FrontendUIBlogPage() {
  return (
    <div>
      <div className="mx-auto max-w-2xl px-5 pt-6 md:px-8">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--accent)]"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
          Back to Blogs
        </Link>
      </div>
      <BlogArticle
        icon={LayersIcon}
        title="Frontend & UI"
        intro="Where to find good UI inspiration, component libraries worth building with, and how to improve your frontend using AI."
        sections={SECTIONS}
      />
    </div>
  );
}
