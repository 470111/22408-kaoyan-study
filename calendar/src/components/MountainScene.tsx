import { useLayoutEffect, useRef, useState } from 'react';
import { useAnimatedValue } from '../hooks/useAnimatedValue';
import { CAMP_MARKERS } from '../mountain/computeAltitude';
import {
  CLOUDS,
  MOUNTAIN_FAR,
  MOUNTAIN_MID,
  MOUNTAIN_NEAR,
  pathAngle,
  SNOW_PARTICLES,
  STARS,
  TRAIL_PATH,
  VIEWBOX,
} from '../mountain/mountainArt';

interface Props {
  altitude: number;
  recentInactive: boolean;
  streakGlowing: boolean;
}

export function MountainScene({ altitude, recentInactive, streakGlowing }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);
  const [climber, setClimber] = useState({ x: 70, y: 400, angle: -45 });
  const [campPoints, setCampPoints] = useState<{ label: string; x: number; y: number; t: number }[]>(
    []
  );

  const targetT = Math.min(Math.max(altitude / 100, 0), 1);
  const displayT = useAnimatedValue(targetT);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    setPathLen(path.getTotalLength());
  }, []);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || pathLen <= 0) return;
    const pt = path.getPointAtLength(pathLen * displayT);
    const angle = pathAngle(path, pathLen, displayT);
    setClimber({ x: pt.x, y: pt.y, angle });
    setCampPoints(
      CAMP_MARKERS.map((camp) => {
        const p = path.getPointAtLength(pathLen * camp.t);
        return { label: camp.label, x: p.x, y: p.y, t: camp.t };
      })
    );
  }, [displayT, pathLen]);

  const snowOpacity = displayT > 0.7 ? Math.min((displayT - 0.7) / 0.3, 1) : 0;
  const skyBrightness = 0.35 + displayT * 0.45;

  return (
    <div
      className={`mountain-scene ${recentInactive ? 'foggy' : ''} ${streakGlowing ? 'glow' : ''}`}
      style={
        {
          '--altitude': displayT,
          '--sky-bright': skyBrightness,
        } as React.CSSProperties
      }
    >
      <svg
        viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
        className="mountain-svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgb(${Math.round(26 + skyBrightness * 40)}, ${Math.round(40 + skyBrightness * 50)}, ${Math.round(64 + skyBrightness * 60)})`} />
            <stop offset="100%" stopColor="#0f1419" />
          </linearGradient>
          <linearGradient id="mountainFarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a6280" />
            <stop offset="100%" stopColor="#243044" />
          </linearGradient>
          <linearGradient id="mountainMidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d5570" />
            <stop offset="100%" stopColor="#1e2d42" />
          </linearGradient>
          <linearGradient id="mountainNearGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f4560" />
            <stop offset="100%" stopColor="#1a2332" />
          </linearGradient>
          <linearGradient id="snowCap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e7ecf3" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e7ecf3" stopOpacity="0" />
          </linearGradient>
          <filter id="summitGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="trailProgress" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6c8cff" />
            <stop offset="100%" stopColor="#e8b86d" />
          </linearGradient>
        </defs>

        <rect width={VIEWBOX.w} height={VIEWBOX.h} fill="url(#skyGrad)" />

        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="#e7ecf3"
            className="star"
            style={{ animationDelay: `${s.delay}s` }}
          />
        ))}

        {CLOUDS.map((c, i) => (
          <ellipse
            key={i}
            cx={c.cx}
            cy={c.cy}
            rx={c.rx}
            ry={c.ry}
            fill="#8b9cb3"
            opacity="0.12"
            className="cloud"
            style={{ animationDelay: `${c.delay}s` }}
          />
        ))}

        <path d={MOUNTAIN_FAR} fill="url(#mountainFarGrad)" opacity="0.55" />
        <path d={MOUNTAIN_MID} fill="url(#mountainMidGrad)" opacity="0.75" />
        <path d={MOUNTAIN_NEAR} fill="url(#mountainNearGrad)" />
        <path
          d="M 200 400 L 260 95 L 320 400 Z"
          fill="url(#snowCap)"
          opacity={snowOpacity}
        />

        <path
          ref={pathRef}
          d={TRAIL_PATH}
          fill="none"
          stroke="#3d4f66"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />
        {pathLen > 0 && (
          <path
            d={TRAIL_PATH}
            fill="none"
            stroke="url(#trailProgress)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={pathLen}
            strokeDashoffset={pathLen * (1 - displayT)}
            className="trail-progress"
          />
        )}

        {campPoints.map((camp) => {
          const reached = displayT >= camp.t - 0.02;
          return (
            <g key={camp.label} className={reached ? 'camp-reached' : 'camp-pending'}>
              <circle cx={camp.x} cy={camp.y} r={reached ? 7 : 5} className="camp-dot" />
              {reached && (
                <path
                  d={`M ${camp.x} ${camp.y - 12} L ${camp.x + 4} ${camp.y - 4} L ${camp.x - 4} ${camp.y - 4} Z`}
                  fill="#e8b86d"
                  className="camp-flag"
                />
              )}
              <text
                x={camp.x + 12}
                y={camp.y + 4}
                fill={reached ? '#e8b86d' : '#8b9cb3'}
                fontSize="11"
                fontFamily="Segoe UI, system-ui, sans-serif"
              >
                {camp.label}
              </text>
            </g>
          );
        })}

        <g
          className="climber"
          transform={`translate(${climber.x}, ${climber.y}) rotate(${climber.angle})`}
        >
          <g className="climber-body">
            <circle cx="0" cy="-14" r="5" fill="#e7ecf3" />
            <path d="M -5 -8 L 0 2 L 5 -8 Z" fill="#6c8cff" />
            <rect x="-6" y="0" width="12" height="10" rx="2" fill="#5a7ab8" />
            <line x1="0" y1="2" x2="-8" y2="14" stroke="#8b9cb3" strokeWidth="2" />
            <line x1="0" y1="2" x2="8" y2="14" stroke="#8b9cb3" strokeWidth="2" />
            <line x1="-4" y1="10" x2="-4" y2="18" stroke="#e7ecf3" strokeWidth="2" />
            <line x1="4" y1="10" x2="4" y2="18" stroke="#e7ecf3" strokeWidth="2" />
            <line x1="6" y1="-4" x2="14" y2="6" stroke="#e8b86d" strokeWidth="2" />
          </g>
        </g>

        {streakGlowing && (
          <circle
            cx={405}
            cy={32}
            r="35"
            fill="#e8b86d"
            opacity="0.15"
            className="summit-glow"
            filter="url(#summitGlowFilter)"
          />
        )}

        {displayT > 0.65 &&
          SNOW_PARTICLES.map((p, i) => (
            <circle
              key={i}
              cx={p.cx}
              cy={80}
              r="2"
              fill="#e7ecf3"
              opacity="0.5"
              className="snow-particle"
              style={{ animationDelay: `${p.delay}s` }}
            />
          ))}

        {recentInactive && <rect className="fog-layer" x="0" y="320" width={VIEWBOX.w} height="120" />}
      </svg>
    </div>
  );
}
