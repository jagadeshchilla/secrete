import Link from "next/link";
import { ArrowLeftIcon, LayersIcon } from "@/components/icons";
import BlogArticle, { type BlogSection } from "@/components/BlogArticle";

const SECTIONS: BlogSection[] = [];

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
