import { dayScore, PHASE_LABELS, SUBJECT_LABELS } from '../scoring';
import type { DayData, Subject, StudyState } from '../types';
import { FocusTimer } from './FocusTimer';

const ORDER: Subject[] = ['math', '408', 'english', 'politics'];

interface Props {
  dateStr: string | null;
  day: DayData | undefined;
  state: StudyState;
  onToggle: (id: string) => void;
  onAddFocus: (dateStr: string, minutes: number) => void;
}

export function DayPanel({ dateStr, day, state, onToggle, onAddFocus }: Props) {
  if (!dateStr || !day) {
    return (
      <div className="panel">
        <p style={{ color: 'var(--muted)', margin: 0 }}>点击日期查看任务</p>
      </div>
    );
  }

  const score = dayScore(dateStr, day, state.completed);
  const bySubject = ORDER.map((sub) => ({
    sub,
    tasks: day.tasks.filter((t) => t.subject === sub),
  })).filter((g) => g.tasks.length > 0);

  const d = new Date(dateStr + 'T12:00:00');
  const title = `${d.getMonth() + 1}月${d.getDate()}日`;

  return (
    <div className="panel">
      <h2>
        {title} · <span className={score >= 85 ? 'score-high' : score >= 70 ? 'score-mid' : 'score-low'}>{score} 分</span>
      </h2>
      {day.mathPhase && (
        <span className="phase-tag">数学：{PHASE_LABELS[day.mathPhase] ?? day.mathPhase}</span>
      )}
      {day.light && (
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '0 0 0.5rem' }}>
          轻量日（建议 6–7h，以复盘/错题为主）
        </p>
      )}
      {bySubject.map(({ sub, tasks }) => (
        <div key={sub} className={`task-group ${sub === '408' ? 'four08' : sub}`}>
          <h3>{SUBJECT_LABELS[sub]}</h3>
          {tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`task-item ${state.completed[t.id] ? 'done' : ''}`}
              onClick={() => onToggle(t.id)}
            >
              {t.text}
            </button>
          ))}
        </div>
      ))}
      <FocusTimer
        dateStr={dateStr}
        plannedHours={day.tasks.reduce((s, t) => s + t.duration, 0)}
        savedMinutes={state.focusMinutes[dateStr] ?? 0}
        onSessionEnd={(m) => onAddFocus(dateStr, m)}
      />
    </div>
  );
}
