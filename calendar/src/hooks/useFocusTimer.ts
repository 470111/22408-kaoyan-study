import { useCallback, useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'kaoyan22408-focus-session';

export type TimerStatus = 'idle' | 'running' | 'paused';

interface SessionData {
  dateStr: string;
  status: TimerStatus;
  accumulatedMs: number;
  segmentStart: number | null;
}

function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function saveSession(data: SessionData | null) {
  if (!data) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function useFocusTimer(dateStr: string, onSessionEnd: (minutes: number) => void) {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [displayMs, setDisplayMs] = useState(0);
  const segmentStartRef = useRef<number | null>(null);
  const dateStrRef = useRef(dateStr);

  useEffect(() => {
    dateStrRef.current = dateStr;
  }, [dateStr]);

  const getElapsed = useCallback(() => {
    let total = accumulatedMs;
    if (status === 'running' && segmentStartRef.current !== null) {
      total += Date.now() - segmentStartRef.current;
    }
    return total;
  }, [accumulatedMs, status]);

  const persist = useCallback(
    (s: TimerStatus, acc: number, segStart: number | null) => {
      if (s === 'idle' && acc === 0) {
        saveSession(null);
        return;
      }
      saveSession({
        dateStr: dateStrRef.current,
        status: s,
        accumulatedMs: acc,
        segmentStart: segStart,
      });
    },
    []
  );

  useEffect(() => {
    const saved = loadSession();
    if (!saved || saved.dateStr !== dateStr) {
      if (saved && saved.dateStr !== dateStr) saveSession(null);
      setStatus('idle');
      setAccumulatedMs(0);
      setDisplayMs(0);
      segmentStartRef.current = null;
      if (!saved || saved.dateStr !== dateStr) return;
    }
    setAccumulatedMs(saved.accumulatedMs);
    if (saved.status === 'running' && saved.segmentStart) {
      const extra = Date.now() - saved.segmentStart;
      setAccumulatedMs(saved.accumulatedMs + extra);
      segmentStartRef.current = Date.now();
      setStatus('running');
      persist('running', saved.accumulatedMs + extra, Date.now());
    } else if (saved.status === 'paused') {
      setStatus('paused');
      segmentStartRef.current = null;
    }
  }, [dateStr, persist]);

  useEffect(() => {
    if (status !== 'running') {
      setDisplayMs(getElapsed());
      return;
    }
    let raf = 0;
    const tick = () => {
      setDisplayMs(getElapsed());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, accumulatedMs, getElapsed]);

  const start = useCallback(() => {
    segmentStartRef.current = Date.now();
    setStatus('running');
    persist('running', accumulatedMs, Date.now());
  }, [accumulatedMs, persist]);

  const pause = useCallback(() => {
    if (status !== 'running' || segmentStartRef.current === null) return;
    const extra = Date.now() - segmentStartRef.current;
    const acc = accumulatedMs + extra;
    setAccumulatedMs(acc);
    segmentStartRef.current = null;
    setStatus('paused');
    persist('paused', acc, null);
  }, [status, accumulatedMs, persist]);

  const resume = useCallback(() => {
    segmentStartRef.current = Date.now();
    setStatus('running');
    persist('running', accumulatedMs, Date.now());
  }, [accumulatedMs, persist]);

  const endSession = useCallback(() => {
    const total = getElapsed();
    const minutes = total >= 60000 ? Math.floor(total / 60000) : total > 0 ? 1 : 0;
    if (minutes > 0) onSessionEnd(minutes);
    setAccumulatedMs(0);
    segmentStartRef.current = null;
    setStatus('idle');
    setDisplayMs(0);
    saveSession(null);
  }, [getElapsed, onSessionEnd]);

  const reset = useCallback(() => {
    setAccumulatedMs(0);
    segmentStartRef.current = null;
    setStatus('idle');
    setDisplayMs(0);
    saveSession(null);
  }, []);

  return {
    status,
    displayMs,
    displayLabel: formatMs(displayMs),
    start,
    pause,
    resume,
    endSession,
    reset,
  };
}
