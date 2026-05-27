import { useAnimatedValue } from '../hooks/useAnimatedValue';

interface Props {
  value: number;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({ value, suffix = '', className }: Props) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const display = useAnimatedValue(clamped / 100, 1200);
  const rounded = Math.round(display * 100);
  return (
    <span className={className}>
      {rounded}
      {suffix}
    </span>
  );
}
