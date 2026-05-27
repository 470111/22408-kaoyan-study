import { useCallback, useEffect, useState } from 'react';
import type { ScheduleData, StudyState } from '../types';

const STORAGE_KEY = 'kaoyan22408-calendar-v2';
const LEGACY_STORAGE_KEY = 'kaoyan22408-calendar-v1';

const defaultState: StudyState = {
  completed: {},
  basicUnlockedRound2: false,
  focusMinutes: {},
};

function loadState(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultState, ...JSON.parse(raw) };
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      const migrated: StudyState = {
        ...defaultState,
        completed: parsed.completed ?? {},
        basicUnlockedRound2: parsed.basicUnlockedRound2 ?? false,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return defaultState;
}

export function useStudyState() {
  const [state, setState] = useState<StudyState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggle = useCallback((taskId: string) => {
    setState((s) => ({
      ...s,
      completed: { ...s.completed, [taskId]: !s.completed[taskId] },
    }));
  }, []);

  const setBasicUnlocked = useCallback((v: boolean) => {
    setState((s) => ({ ...s, basicUnlockedRound2: v }));
  }, []);

  const clearDay = useCallback((taskIds: string[]) => {
    setState((s) => {
      const completed = { ...s.completed };
      for (const id of taskIds) delete completed[id];
      return { ...s, completed };
    });
  }, []);

  const addFocusMinutes = useCallback((dateStr: string, minutes: number) => {
    if (minutes <= 0) return;
    setState((s) => ({
      ...s,
      focusMinutes: {
        ...s.focusMinutes,
        [dateStr]: (s.focusMinutes[dateStr] ?? 0) + minutes,
      },
    }));
  }, []);

  return { state, toggle, setBasicUnlocked, clearDay, addFocusMinutes };
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/tasks.json`)
      .then((r) => {
        if (!r.ok) throw new Error('无法加载 tasks.json');
        return r.json();
      })
      .then(setSchedule)
      .catch((e) => setError(String(e.message)));
  }, []);

  return { schedule, error };
}
