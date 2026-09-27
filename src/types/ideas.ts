import type { Profile } from "@/config/access";

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  domains: string[]; // full domain strings, e.g. "🤖 AI / Machine Learning"
  roleKeys: string[]; // `${domain}||${role}`, same key shape as ProgressState
  createdBy: Profile;
  createdAt: string;
}
