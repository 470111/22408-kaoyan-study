import { useMemo, useState } from 'react';
import { DayPanel } from './components/DayPanel';
import { MonthView } from './components/MonthView';
import { PhaseSummary } from './components/PhaseSummary';
import { useSchedule, useStudyState } from './hooks/useStudyState';

const MIN_MONTH = { y: 2026, m: 5 };
const MAX_MONTH = { y: 2026, m: 12 };

export default function App() {
  const { schedule, error } = useSchedule();
  const { state, toggle, setBasicUnlocked } = useStudyState();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-05-26');

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y--;
    } else if (m > 12) {
      m = 1;
      y++;
    }
    if (y < MIN_MONTH.y || (y === MIN_MONTH.y && m < MIN_MONTH.m)) return;
    if (y > MAX_MONTH.y || (y === MAX_MONTH.y && m > MAX_MONTH.m)) return;
    setYear(y);
    setMonth(m);
  };

  const selectedDay = useMemo(() => {
    if (!schedule || !selectedDate) return undefined;
    return schedule.days[selectedDate];
  }, [schedule, selectedDate]);

  if (error) {
    return <div className="error">加载失败：{error}。请先运行 npm run build 或 npm run dev。</div>;
  }
  if (!schedule) {
    return <div className="loading">加载日程…</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>22408 学习日历</h1>
        <p className="sub">
          5.26 起 · 百分制日/月/阶段分 · 点击任务划掉 · 数据来自日表 md（政治 ≤10.10 暂停）
        </p>
      </header>

      <div className="nav-month">
        <button type="button" onClick={() => shiftMonth(-1)}>
          ← 上月
        </button>
        <span className="title">
          {year} 年 {month} 月
        </span>
        <button type="button" onClick={() => shiftMonth(1)}>
          下月 →
        </button>
      </div>

      <PhaseSummary
        year={year}
        month={month}
        schedule={schedule}
        completed={state.completed}
      />

      <div className="layout">
        <MonthView
          year={year}
          month={month}
          schedule={schedule}
          selectedDate={selectedDate}
          completed={state.completed}
          onSelect={setSelectedDate}
        />
        <div>
          <DayPanel
            dateStr={selectedDate}
            day={selectedDay}
            state={state}
            onToggle={toggle}
          />
          <div className="panel settings" style={{ marginTop: '0.75rem' }}>
            <label>
              <input
                type="checkbox"
                checked={state.basicUnlockedRound2}
                onChange={(e) => setBasicUnlocked(e.target.checked)}
              />
              我已基础达标，按二轮执行（文档 flex 切换）
            </label>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)' }}>
              完成状态保存在本机浏览器，清缓存会丢失。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
