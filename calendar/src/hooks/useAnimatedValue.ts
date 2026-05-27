import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 1200;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useAnimatedValue(target: number, durationMs = DURATION_MS): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<{ from: number; startTime: number } | null>(null);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(target);
      displayRef.current = target;
      return;
    }

    const from = displayRef.current;
    if (Math.abs(from - target) < 0.0001) return;

    startRef.current = { from, startTime: performance.now() };

    const tick = (now: number) => {
      const start = startRef.current;
      if (!start) return;
      const elapsed = now - start.startTime;
      const t = Math.min(elapsed / durationMs, 1);
      const next = start.from + (target - start.from) * easeOutCubic(t);
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        startRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs]);

  return display;
}
