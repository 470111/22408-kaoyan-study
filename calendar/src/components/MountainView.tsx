import { useMemo } from 'react';
import { computeAchievements } from '../mountain/achievements';
import { computeAltitude } from '../mountain/computeAltitude';
import type { ScheduleData, StudyState } from '../types';
import { AchievementList } from './AchievementList';
import { AnimatedNumber } from './AnimatedNumber';
import { FocusTimer } from './FocusTimer';
import { MountainScene } from './MountainScene';

interface Props {
  schedule: ScheduleData;
  state: StudyState;
  focusDate: string;
  onAddFocus: (dateStr: string, minutes: number) => void;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MountainView({ schedule, state, focusDate, onAddFocus }: Props) {
  const stats = useMemo(() => computeAltitude(schedule, state), [schedule, state]);
  const achievements = useMemo(
    () => computeAchievements(schedule, state, stats),
    [schedule, state, stats]
  );

  const dateStr = focusDate || todayStr();
  const day = schedule.days[dateStr];
  const plannedHours = day?.tasks.reduce((s, t) => s + t.duration, 0) ?? 0;
  const savedMinutes = state.focusMinutes[dateStr] ?? 0;

  const focusHours =
    stats.totalFocusMinutes >= 60
      ? `${(stats.totalFocusMinutes / 60).toFixed(1)}h`
      : `${stats.totalFocusMinutes}m`;

  return (
    <div className="mountain-page">
      <div className="mountain-timer-row">
        <FocusTimer
          dateStr={dateStr}
          plannedHours={plannedHours}
          savedMinutes={savedMinutes}
          onSessionEnd={(m) => onAddFocus(dateStr, m)}
        />
      </div>

      <div className="mountain-hero">
        <MountainScene
          altitude={stats.altitude}
          recentInactive={stats.recentInactive}
          streakGlowing={stats.currentStreak >= 7}
        />
        <aside className="mountain-stats-glass">
          <div className="altitude-big">
            <span className="label">海拔</span>
            <span className="value">
              <AnimatedNumber value={stats.altitude} suffix="%" />
            </span>
          </div>
          <p className="camp-name" key={stats.currentCamp}>
            {stats.currentCamp}
          </p>
          <dl className="stat-dl">
            <dt>连续活跃</dt>
            <dd>{stats.currentStreak} 天</dd>
            <dt>最长连续</dt>
            <dd>{stats.longestStreak} 天</dd>
            <dt>累计专注</dt>
            <dd>{focusHours}</dd>
            <dt>活跃天数</dt>
            <dd>
              {stats.activeDays} / {stats.elapsedDays}
            </dd>
          </dl>
        </aside>
      </div>

      <div className="mountain-bottom">
        <div className="score-bars">
          <h3>三维得分</h3>
          <div className="score-bar-row">
            <span>学习进度 (50%)</span>
            <div className="bar-track">
              <div
                className="bar-fill progress"
                style={{ '--bar-target': `${stats.progressScore}%` } as React.CSSProperties}
              />
            </div>
            <span>{stats.progressScore}%</span>
          </div>
          <div className="score-bar-row">
            <span>打卡频率 (30%)</span>
            <div className="bar-track">
              <div
                className="bar-fill frequency"
                style={{ '--bar-target': `${stats.frequencyScore}%` } as React.CSSProperties}
              />
            </div>
            <span>{stats.frequencyScore}%</span>
          </div>
          <div className="score-bar-row">
            <span>专注时间 (20%)</span>
            <div className="bar-track">
              <div
                className="bar-fill focus"
                style={{ '--bar-target': `${stats.focusScore}%` } as React.CSSProperties}
              />
            </div>
            <span>{stats.focusScore}%</span>
          </div>
        </div>
        <AchievementList achievements={achievements} />
      </div>
    </div>
  );
}
