'use client';

import { useId } from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}

/**
 * Tiny inline-SVG area sparkline — matches web_viz.jsx `Spark`.
 * Pure SVG (no recharts) to stay crisp at ~90x34 and avoid layout cost.
 */
export function Sparkline({ data, color = 'var(--spark, #0D783C)', w = 90, h = 34 }: SparklineProps) {
  const id = useId().replace(/:/g, '');
  if (data.length < 2) return <svg width={w} height={h} />;

  const mx = Math.max(...data);
  const mn = Math.min(...data);
  const pts = data.map((d, i) => [
    (i / (data.length - 1)) * w,
    h - ((d - mn) / (mx - mn || 1)) * (h - 5) - 3,
  ]);
  const dStr = pts
    .map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1))
    .join(' ');

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.25" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${dStr} L${w} ${h} L0 ${h} Z`} fill={`url(#${id})`} />
      <path
        d={dStr}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
