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
