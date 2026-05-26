import type { DayData, ScheduleData, Subject, Task } from './types';

export function subjectWeights(dateStr: string): Record<Subject, number> {
  const politicsOn = dateStr >= '2026-10-11';
  if (dateStr < '2026-07-01') {
    return { math: 3.75, '408': 3.25, english: 1, politics: 0 };
  }
  if (!politicsOn) {
    return { math: 5, '408': 5, english: 1.5, politics: 0 };
  }
  return { math: 4, '408': 4, english: 1.5, politics: 1.5 };
}

/** 科内按 duration 比例分配日权重 */
export function taskWeight(dateStr: string, task: Task, dayTasks: Task[]): number {
  const weights = subjectWeights(dateStr);
  const subW = weights[task.subject];
  if (subW <= 0) return 0;
  const group = dayTasks.filter((t) => t.subject === task.subject);
  const totalDur = group.reduce((s, t) => s + t.duration, 0) || 1;
  return (subW * task.duration) / totalDur;
}

export function dayScore(
  dateStr: string,
  day: DayData,
  completed: Record<string, boolean>
): number {
  const tasks = day.tasks;
  if (!tasks.length) return 0;
  let done = 0;
  let total = 0;
  for (const t of tasks) {
    const w = taskWeight(dateStr, t, tasks);
    if (weightsZero(dateStr, t.subject)) continue;
    total += w;
    if (completed[t.id]) done += w;
  }
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

function weightsZero(dateStr: string, subject: Subject): boolean {
  return subjectWeights(dateStr)[subject] <= 0;
}

export function monthScore(
  year: number,
  month: number,
  schedule: ScheduleData,
  completed: Record<string, boolean>
): number | null {
  const scores: number[] = [];
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  for (const [dateStr, day] of Object.entries(schedule.days)) {
    if (!dateStr.startsWith(prefix)) continue;
    if (dateStr < schedule.startDate) continue;
    if (day.tasks.length === 0) continue;
    scores.push(dayScore(dateStr, day, completed));
  }
  if (!scores.length) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export type PhaseKey = 'basic' | 'round2' | 'intensive' | 'exam' | 'sprint';

const PHASE_RANGES: { key: PhaseKey; label: string; from: string; to: string }[] = [
  { key: 'basic', label: '基础', from: '2026-05-26', to: '2026-06-25' },
  { key: 'round2', label: '二轮', from: '2026-06-20', to: '2026-07-09' },
  { key: 'intensive', label: '强化', from: '2026-07-10', to: '2026-08-31' },
  { key: 'exam', label: '真题', from: '2026-09-01', to: '2026-10-10' },
  { key: 'sprint', label: '冲刺', from: '2026-10-11', to: '2026-12-19' },
];

export function phaseScores(
  schedule: ScheduleData,
  completed: Record<string, boolean>
): { key: PhaseKey; label: string; score: number | null }[] {
  return PHASE_RANGES.map((p) => {
    const scores: number[] = [];
    for (const [dateStr, day] of Object.entries(schedule.days)) {
      if (dateStr < p.from || dateStr > p.to) continue;
      if (!day.tasks.length) continue;
      scores.push(dayScore(dateStr, day, completed));
    }
    return {
      key: p.key,
      label: p.label,
      score: scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null,
    };
  });
}

export const SUBJECT_LABELS: Record<Subject, string> = {
  math: '数学',
  '408': '408',
  english: '英语',
  politics: '政治',
};

export const PHASE_LABELS: Record<string, string> = {
  basic: '基础',
  round2: '二轮',
  intensive: '强化',
  exam: '真题',
  sprint: '冲刺',
};
