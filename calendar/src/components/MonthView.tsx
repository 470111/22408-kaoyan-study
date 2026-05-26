import { dayScore } from '../scoring';
import type { DayData, ScheduleData } from '../types';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

interface Props {
  year: number;
  month: number;
  schedule: ScheduleData;
  selectedDate: string | null;
  completed: Record<string, boolean>;
  onSelect: (dateStr: string) => void;
}

function scoreClass(score: number): string {
  if (score >= 85) return 'score-high';
  if (score >= 70) return 'score-mid';
  return 'score-low';
}

export function MonthView({
  year,
  month,
  schedule,
  selectedDate,
  completed,
  onSelect,
}: Props) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();

  const cells: { dateStr: string | null; day?: number; data?: DayData }[] = [];
  for (let i = 0; i < startPad; i++) cells.push({ dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ dateStr, day: d, data: schedule.days[dateStr] });
  }

  return (
    <div className="calendar-grid">
      <div className="weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="days">
        {cells.map((cell, idx) => {
          if (!cell.dateStr) {
            return <div key={`e-${idx}`} className="day-cell out-range" />;
          }
          const inRange =
            cell.dateStr >= schedule.startDate &&
            cell.dateStr <= schedule.endDate;
          const day = cell.data;
          const tasks = day?.tasks ?? [];
          const score =
            tasks.length > 0 ? dayScore(cell.dateStr, { tasks }, completed) : null;
          const doneCount = tasks.filter((t) => completed[t.id]).length;
          const selected = selectedDate === cell.dateStr;

          return (
            <button
              key={cell.dateStr}
              type="button"
              className={[
                'day-cell',
                selected ? 'selected' : '',
                day?.light ? 'light' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={!inRange}
              onClick={() => inRange && onSelect(cell.dateStr)}
            >
              <span className="day-num">{cell.day}</span>
              {inRange && tasks.length > 0 && score !== null && (
                <span className={`day-score ${scoreClass(score)}`}>{score}</span>
              )}
              {inRange && tasks.length > 0 && (
                <span className="day-meta">
                  {doneCount}/{tasks.length} 项
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
