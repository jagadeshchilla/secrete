import aiDataResearch from "@/data/certifications/ai_data_research_certifications.json";
import aiGovernance from "@/data/certifications/ai_governance_risk_compliance_certifications.json";
import aiInfrastructure from "@/data/certifications/ai_infrastructure_mlops_llmops_certifications.json";
import aiMachineLearning from "@/data/certifications/ai_machine_learning_certifications.json";
import businessAnalysis from "@/data/certifications/business_analysis_certifications.json";
import cloudDevops from "@/data/certifications/cloud_devops_infrastructure_certifications.json";
import dataEngineering from "@/data/certifications/data_engineering_data_certifications.json";

export type LevelTier = "beginner" | "associate" | "professional" | "expert" | "other";

export const LEVEL_TIER_LABELS: Record<LevelTier, string> = {
  beginner: "Beginner",
  associate: "Associate",
  professional: "Professional",
  expert: "Expert",
  other: "Other",
};

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  type: string;
  about: string;
  price: string;
  isFree: boolean;
  level: string;
  levelTier: LevelTier;
  link: string;
  usefulRoles: string[];
  domain: string;
}

// The 7 source files use ~35 different free-text level labels between them
// (e.g. "Associate / beginner-to-intermediate", "Foundational to professional").
// This buckets each into one broad tier for filtering, while the original
// text is kept as `level` for display on the card.
function levelTierOf(level: string): LevelTier {
  const l = level.toLowerCase();
  if (l.includes("expert") || l.includes("specialty")) return "expert";
  if (l.includes("professional") || l.includes("advanced") || l.includes("practitioner")) return "professional";
  if (l.includes("associate") || l.includes("intermediate")) return "associate";
  if (l.includes("beginner") || l.includes("entry") || l.includes("foundational")) return "beginner";
  return "other";
}

// Each source file was researched separately and ended up with its own field
// names for the same concepts (name vs credential_name, link vs official_url,
// a price object vs a plain cost string, etc). This reads whichever key is
// present instead of assuming one fixed shape.
function pick(raw: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function pickRoles(raw: Record<string, unknown>, keys: string[]): string[] {
  for (const k of keys) {
    const v = raw[k];
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  }
  return [];
}

function formatPrice(raw: Record<string, unknown>): { text: string; isFree: boolean } {
  const priceObj = raw.price;
  if (priceObj && typeof priceObj === "object") {
    const p = priceObj as { amount?: number | null; currency?: string; status?: string };
    if (p.status?.toLowerCase() === "free" || p.amount === 0) return { text: "Free", isFree: true };
    if (typeof p.amount === "number") return { text: `${p.currency || "USD"} ${p.amount}`, isFree: false };
    return { text: p.status || "Paid", isFree: false };
  }
  const text = pick(raw, ["cost", "price_usd_or_cost_note", "price_and_cost_notes"]) || "Price varies";
  return { text, isFree: /\bfree\b/i.test(text) };
}

function normalize(file: { domain: string; credentials: unknown[] }): Certification[] {
  return (file.credentials as Record<string, unknown>[]).map((raw, i) => {
    const { text: price, isFree } = formatPrice(raw);
    const level = pick(raw, ["level"]);
    return {
      id: `${file.domain}-${i}`,
      name: pick(raw, ["name", "credential_name"]),
      issuer: pick(raw, ["issuer"]),
      type: pick(raw, ["type", "credential_type"]),
      about: pick(raw, ["about", "focus", "focus_and_skills"]),
      price,
      isFree,
      level,
      levelTier: levelTierOf(level),
      link: pick(raw, ["link", "official_url", "official_link"]),
      usefulRoles: pickRoles(raw, ["useful_roles", "matching_roles", "matched_roles", "mapped_roles"]),
      domain: file.domain,
    };
  });
}

export const CERTIFICATIONS: Certification[] = [
  ...normalize(aiDataResearch),
  ...normalize(aiGovernance),
  ...normalize(aiInfrastructure),
  ...normalize(aiMachineLearning),
  ...normalize(businessAnalysis),
  ...normalize(cloudDevops),
  ...normalize(dataEngineering),
].filter((c) => c.name && c.link);

export const CERTIFICATION_DOMAINS = Array.from(new Set(CERTIFICATIONS.map((c) => c.domain)));
