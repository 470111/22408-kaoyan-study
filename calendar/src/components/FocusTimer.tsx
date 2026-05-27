import { useFocusTimer } from '../hooks/useFocusTimer';

interface Props {
  dateStr: string;
  plannedHours: number;
  savedMinutes: number;
  onSessionEnd: (minutes: number) => void;
}

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}m`;
  return `${min}m`;
}

export function FocusTimer({ dateStr, plannedHours, savedMinutes, onSessionEnd }: Props) {
  const { status, displayLabel, start, pause, resume, endSession, reset } = useFocusTimer(
    dateStr,
    onSessionEnd
  );

  const plannedMin = Math.round(plannedHours * 60);

  return (
    <div className="focus-timer">
      <h3>专注计时</h3>
      <div className="focus-timer-display">{displayLabel}</div>
      <div className="focus-timer-meta">
        <span>本次</span>
        <span>
          累计 {formatMinutes(savedMinutes)}
          {plannedMin > 0 ? ` / 计划 ${formatMinutes(plannedMin)}` : ''}
        </span>
      </div>
      <div className="focus-timer-actions">
        {status === 'idle' && (
          <button type="button" className="focus-btn primary" onClick={start}>
            开始专注
          </button>
        )}
        {status === 'running' && (
          <>
            <button type="button" className="focus-btn" onClick={pause}>
              暂停
            </button>
            <button type="button" className="focus-btn primary" onClick={endSession}>
              结束本次
            </button>
          </>
        )}
        {status === 'paused' && (
          <>
            <button type="button" className="focus-btn primary" onClick={resume}>
              继续
            </button>
            <button type="button" className="focus-btn" onClick={endSession}>
              结束本次
            </button>
            <button type="button" className="focus-btn muted" onClick={reset}>
              放弃
            </button>
          </>
        )}
      </div>
    </div>
  );
}
