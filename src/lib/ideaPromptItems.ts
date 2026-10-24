import type { IdeaPromptItem } from "@/types/ideas";

// research_topics/methods used to be stored as plain strings (and may still be
// cached that way in a browser's localStorage from before); normalize any
// shape into {id, text, prompt?} so rendering never sees a bare string.
export function normalizePromptItems(raw: unknown): IdeaPromptItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((t, i) =>
    typeof t === "string" ? { id: `legacy-${i}`, text: t } : (t as IdeaPromptItem)
  );
}
