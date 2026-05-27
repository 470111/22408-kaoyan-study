import type { AltitudeStats } from './computeAltitude';
import type { ScheduleData, StudyState } from '../types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function computeAchievements(
  schedule: ScheduleData,
  state: StudyState,
  stats: AltitudeStats
): Achievement[] {
  const hasCompleted = Object.values(state.completed).some(Boolean);
  const today = todayStr();

  const focusDay100 = Object.entries(schedule.days).some(([dateStr, day]) => {
    const planned = day.tasks.reduce((s, t) => s + t.duration, 0);
    const mins = state.focusMinutes[dateStr] ?? 0;
    return planned > 0 && mins >= planned * 60;
  });

  const defs: { id: string; name: string; description: string; unlocked: boolean }[] = [
    {
      id: 'first_step',
      name: '迈出第一步',
      description: '完成任意一项任务',
      unlocked: hasCompleted,
    },
    {
      id: 'camp_basic',
      name: '基础营地',
      description: '海拔达到 20% 或进入二轮阶段',
      unlocked: stats.altitude >= 20 || today >= '2026-06-20',
    },
    {
      id: 'streak_7',
      name: '连攀七日',
      description: '连续 7 天保持活跃（打卡≥70分或专注≥30分钟）',
      unlocked: stats.currentStreak >= 7 || stats.longestStreak >= 7,
    },
    {
      id: 'focus_day_100',
      name: '单日全专注',
      description: '某日专注时长达到当日计划学时',
      unlocked: focusDay100,
    },
    {
      id: 'focus_100h',
      name: '百小时专注',
      description: '累计专注 100 小时',
      unlocked: stats.totalFocusMinutes >= 6000,
    },
    {
      id: 'camp_sprint',
      name: '冲刺营地',
      description: '进入冲刺阶段（10.11 起）',
      unlocked: today >= '2026-10-11',
    },
    {
      id: 'summit_ready',
      name: '雪峰在望',
      description: '海拔达到 85%',
      unlocked: stats.altitude >= 85,
    },
  ];

  return defs;
}
