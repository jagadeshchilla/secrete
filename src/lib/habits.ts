import type { Habit } from "@/types/habits";
import { todayKey } from "@/lib/dateKey";

// A habit's calendar days, indexed 1..durationDays from its startDate — not
// week-based like the activity heatmap, since a habit has a fixed length.
export function habitDayKeys(habit: Habit): string[] {
  const start = new Date(habit.startDate);
  const keys: string[] = [];
  for (let i = 0; i < habit.durationDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    keys.push(todayKey(d));
  }
  return keys;
}

export function habitStats(habit: Habit) {
  const days = habitDayKeys(habit);
  const today = todayKey();
  const elapsedCount = days.filter((d) => d <= today).length;
  const doneCount = days.filter((d) => habit.checkIns[d]).length;
  const completed = elapsedCount >= habit.durationDays;
  const daysRemaining = Math.max(habit.durationDays - elapsedCount, 0);

  let currentStreak = 0;
  for (let i = elapsedCount - 1; i >= 0; i--) {
    if (habit.checkIns[days[i]]) currentStreak++;
    else break;
  }

  return {
    days,
    today,
    elapsedCount,
    doneCount,
    completed,
    daysRemaining,
    currentStreak,
    completionPct: habit.durationDays ? Math.round((doneCount / habit.durationDays) * 100) : 0,
  };
}
