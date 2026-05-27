import { useEffect, useRef, useState } from 'react';
import { CAMP_MARKERS } from '../mountain/computeAltitude';

const TRAIL_PATH =
  'M 80 380 C 120 340, 140 300, 160 270 S 200 220, 220 200 S 260 160, 280 140 S 320 100, 340 80 S 380 50, 400 35';

interface Props {
  altitude: number;
  recentInactive: boolean;
  streakGlowing: boolean;
}

interface Point {
  x: number;
  y: number;
}

export function MountainScene({ altitude, recentInactive, streakGlowing }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const [climberPos, setClimberPos] = useState<Point>({ x: 80, y: 380 });
  const [campPoints, setCampPoints] = useState<{ label: string; x: number; y: number }[]>([]);

  const t = Math.min(Math.max(altitude / 100, 0), 1);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const pt = path.getPointAtLength(len * t);
    setClimberPos({ x: pt.x, y: pt.y });
    setCampPoints(
      CAMP_MARKERS.map((camp) => {
        const p = path.getPointAtLength(len * camp.t);
        return { label: camp.label, x: p.x, y: p.y };
      })
    );
  }, [t]);

  return (
    <div
      className={`mountain-scene ${recentInactive ? 'foggy' : ''} ${streakGlowing ? 'glow' : ''}`}
      style={{ '--altitude': t } as React.CSSProperties}
    >
      <svg viewBox="0 0 480 400" className="mountain-svg" aria-hidden>
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2840" />
            <stop offset="100%" stopColor="#0f1419" />
          </linearGradient>
          <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d5a80" />
            <stop offset="100%" stopColor="#243044" />
          </linearGradient>
        </defs>
        <rect width="480" height="400" fill="url(#skyGrad)" />
        <polygon
          points="0,400 120,180 240,120 360,200 480,400"
          fill="url(#mountainGrad)"
          opacity="0.6"
        />
        <polygon points="200,400 300,100 400,400" fill="#2a384d" opacity="0.85" />
        <path
          ref={pathRef}
          d={TRAIL_PATH}
          fill="none"
          stroke="#6c8cff"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.7"
        />
        {campPoints.map((camp) => (
          <g key={camp.label}>
            <circle cx={camp.x} cy={camp.y} r="5" fill="#e8b86d" opacity="0.9" />
            <text
              x={camp.x + 10}
              y={camp.y + 4}
              fill="#8b9cb3"
              fontSize="11"
              fontFamily="Segoe UI, system-ui, sans-serif"
            >
              {camp.label}
            </text>
          </g>
        ))}
        <g
          className="climber"
          transform={`translate(${climberPos.x - 8}, ${climberPos.y - 16})`}
        >
          <circle cx="8" cy="4" r="5" fill="#e7ecf3" />
          <path d="M 4 10 L 8 16 L 12 10 Z" fill="#6c8cff" />
          <line x1="8" y1="16" x2="5" y2="22" stroke="#e7ecf3" strokeWidth="2" />
          <line x1="8" y1="16" x2="11" y2="22" stroke="#e7ecf3" strokeWidth="2" />
        </g>
        {recentInactive && (
          <rect x="0" y="300" width="480" height="100" fill="#8b9cb3" opacity="0.15" />
        )}
        {streakGlowing && (
          <circle cx="400" cy="35" r="30" fill="#e8b86d" opacity="0.12" />
        )}
      </svg>
    </div>
  );
}
