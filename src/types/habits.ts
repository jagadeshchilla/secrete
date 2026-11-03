import type { Profile } from "@/config/access";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  durationDays: number; // 30, 60, 90, or any custom positive integer
  startDate: string; // local calendar-day key, YYYY-MM-DD — NOT a timestamp
  createdBy: Profile;
  createdAt: string; // ISO timestamp, for sorting only
  checkIns: Record<string, boolean>; // date-key (YYYY-MM-DD) -> done
}
