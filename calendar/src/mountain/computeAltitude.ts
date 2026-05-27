import { dayScore, taskWeight } from '../scoring';
import type { DayData, ScheduleData, StudyState } from '../types';

export interface AltitudeStats {
  altitude: number;
  progressScore: number;
  frequencyScore: number;
  focusScore: number;
  consistency: number;
  streakBonus: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  elapsedDays: number;
  totalFocusMinutes: number;
  currentCamp: string;
  recentInactive: boolean;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function plannedHours(day: DayData): number {
  return day.tasks.reduce((s, t) => s + t.duration, 0);
}

function isActiveDay(
  dateStr: string,
  day: DayData,
  completed: Record<string, boolean>,
  focusMinutes: Record<string, number>
): boolean {
  if (dayScore(dateStr, day, completed) >= 70) return true;
  return (focusMinutes[dateStr] ?? 0) >= 30;
}

function getElapsedDates(schedule: ScheduleData): string[] {
  const end = todayStr() < schedule.endDate ? todayStr() : schedule.endDate;
  const dates: string[] = [];
  for (const dateStr of Object.keys(schedule.days).sort()) {
    if (dateStr < schedule.startDate || dateStr > end) continue;
    const day = schedule.days[dateStr];
    if (!day?.tasks.length) continue;
    dates.push(dateStr);
  }
  return dates;
}

function computeStreaks(
  dates: string[],
  schedule: ScheduleData,
  completed: Record<string, boolean>,
  focusMinutes: Record<string, number>
): { current: number; longest: number; activeDays: number } {
  let longest = 0;
  let run = 0;
  let activeDays = 0;
  for (const dateStr of dates) {
    const day = schedule.days[dateStr];
    if (isActiveDay(dateStr, day, completed, focusMinutes)) {
      activeDays++;
      run++;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }
  let current = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const day = schedule.days[dates[i]];
    if (isActiveDay(dates[i], day, completed, focusMinutes)) {
      current++;
    } else {
      break;
    }
  }
  return { current, longest, activeDays };
}

const CAMPS = [
  { label: '山脚', minAltitude: 0 },
  { label: '基础营地', minAltitude: 0.2 },
  { label: '二轮营地', minAltitude: 0.35 },
  { label: '强化营地', minAltitude: 0.55 },
  { label: '真题营地', minAltitude: 0.75 },
  { label: '冲刺营地', minAltitude: 0.9 },
];

function currentCampLabel(altitude: number): string {
  let camp = CAMPS[0].label;
  for (const c of CAMPS) {
    if (altitude >= c.minAltitude) camp = c.label;
  }
  return camp;
}

export function computeAltitude(
  schedule: ScheduleData,
  state: Pick<StudyState, 'completed' | 'focusMinutes'>
): AltitudeStats {
  const { completed, focusMinutes } = state;
  const dates = getElapsedDates(schedule);
  const elapsedDays = dates.length || 1;

  let doneWeight = 0;
  let totalWeight = 0;
  let focusRatioSum = 0;
  let totalFocusMinutes = 0;

  for (const dateStr of dates) {
    const day = schedule.days[dateStr];
    const tasks = day.tasks;
    for (const t of tasks) {
      const w = taskWeight(dateStr, t, tasks);
      totalWeight += w;
      if (completed[t.id]) doneWeight += w;
    }
    const planned = plannedHours(day);
    const mins = focusMinutes[dateStr] ?? 0;
    totalFocusMinutes += mins;
    if (planned > 0) {
      focusRatioSum += Math.min(mins / 60 / planned, 1);
    }
  }

  const progressScore = totalWeight > 0 ? doneWeight / totalWeight : 0;
  const { current: currentStreak, longest: longestStreak, activeDays } = computeStreaks(
    dates,
    schedule,
    completed,
    focusMinutes
  );

  const consistency = activeDays / elapsedDays;
  const streakBonus = Math.min(currentStreak / 7, 1);
  const frequencyScore = consistency * 0.5 + streakBonus * 0.5;
  const focusScore = focusRatioSum / elapsedDays;

  const altitude = Math.round(
    (progressScore * 0.5 + consistency * 0.15 + streakBonus * 0.15 + focusScore * 0.2) * 100
  );

  const recentDates = dates.slice(-3);
  const recentInactive =
    recentDates.length > 0 &&
    recentDates.every(
      (d) => !isActiveDay(d, schedule.days[d], completed, focusMinutes)
    );

  return {
    altitude,
    progressScore: Math.round(progressScore * 100),
    frequencyScore: Math.round(frequencyScore * 100),
    focusScore: Math.round(focusScore * 100),
    consistency: Math.round(consistency * 100),
    streakBonus: Math.round(streakBonus * 100),
    currentStreak,
    longestStreak,
    activeDays,
    elapsedDays,
    totalFocusMinutes,
    currentCamp: currentCampLabel(altitude / 100),
    recentInactive,
  };
}

export const CAMP_MARKERS = [
  { label: '基础', t: 0.2 },
  { label: '二轮', t: 0.35 },
  { label: '强化', t: 0.55 },
  { label: '真题', t: 0.75 },
  { label: '冲刺', t: 0.9 },
];
