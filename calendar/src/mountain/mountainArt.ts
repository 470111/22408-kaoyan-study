export const VIEWBOX = { w: 480, h: 440 };

export const TRAIL_PATH =
  'M 70 400 C 110 360, 130 320, 155 285 S 195 235, 220 210 S 255 170, 285 145 S 325 105, 355 75 S 385 48, 405 32';

export const MOUNTAIN_FAR =
  'M 0 400 L 90 220 L 200 260 L 320 200 L 480 400 Z';

export const MOUNTAIN_MID =
  'M 60 400 L 180 160 L 300 200 L 420 400 Z';

export const MOUNTAIN_NEAR =
  'M 140 400 L 260 95 L 380 400 Z';

export const STARS: { cx: number; cy: number; r: number; delay: number }[] = [
  { cx: 40, cy: 35, r: 1.2, delay: 0 },
  { cx: 120, cy: 22, r: 1, delay: 0.4 },
  { cx: 200, cy: 48, r: 1.3, delay: 0.8 },
  { cx: 280, cy: 18, r: 0.9, delay: 1.2 },
  { cx: 350, cy: 40, r: 1.1, delay: 0.2 },
  { cx: 420, cy: 28, r: 1.2, delay: 0.6 },
  { cx: 80, cy: 70, r: 0.8, delay: 1 },
  { cx: 440, cy: 55, r: 1, delay: 1.4 },
  { cx: 160, cy: 12, r: 0.9, delay: 0.3 },
  { cx: 310, cy: 62, r: 1, delay: 0.9 },
];

export const CLOUDS: { cx: number; cy: number; rx: number; ry: number; delay: number }[] = [
  { cx: 100, cy: 90, rx: 45, ry: 14, delay: 0 },
  { cx: 280, cy: 110, rx: 55, ry: 16, delay: 8 },
  { cx: 400, cy: 75, rx: 40, ry: 12, delay: 16 },
];

export const SNOW_PARTICLES: { cx: number; delay: number }[] = [
  { cx: 120, delay: 0 },
  { cx: 240, delay: 1.2 },
  { cx: 360, delay: 2.4 },
  { cx: 180, delay: 0.6 },
  { cx: 300, delay: 1.8 },
];

export function pathAngle(path: SVGPathElement, len: number, t: number): number {
  const delta = 2;
  const p1 = path.getPointAtLength(Math.max(0, len * t - delta));
  const p2 = path.getPointAtLength(Math.min(len, len * t + delta));
  return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
}
