import { ROADMAP_DATA } from "@/data/roadmapData";

export interface ToolEntry {
  tool: string;
  count: number;
  roles: { domain: string; role: string }[];
}

function buildToolCatalog(): ToolEntry[] {
  const map = new Map<string, ToolEntry>();
  Object.entries(ROADMAP_DATA).forEach(([key, entry]) => {
    const [domain, role] = key.split("||");
    entry.skills.forEach((stage) => {
      stage.items.forEach((item) => {
        if (!map.has(item)) map.set(item, { tool: item, count: 0, roles: [] });
        const rec = map.get(item)!;
        rec.count += 1;
        rec.roles.push({ domain, role });
      });
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count || a.tool.localeCompare(b.tool));
}

export const TOOL_CATALOG: ToolEntry[] = buildToolCatalog();
