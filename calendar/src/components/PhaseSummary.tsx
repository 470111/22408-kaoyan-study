import { monthScore, phaseScores } from '../scoring';
import type { ScheduleData } from '../types';

interface Props {
  year: number;
  month: number;
  schedule: ScheduleData;
  completed: Record<string, boolean>;
}

export function PhaseSummary({ year, month, schedule, completed }: Props) {
  const mScore = monthScore(year, month, schedule, completed);
  const phases = phaseScores(schedule, completed);

  return (
    <div className="summary-bar">
      <span>
        <strong>{month}月</strong>{' '}
        {mScore !== null ? (
          <span className={mScore >= 85 ? 'score-high' : mScore >= 70 ? 'score-mid' : 'score-low'}>
            均分 {mScore}
          </span>
        ) : (
          '暂无数据'
        )}
      </span>
      {phases.map((p) =>
        p.score !== null ? (
          <span key={p.key}>
            {p.label} {p.score}
          </span>
        ) : null
      )}
    </div>
  );
}
