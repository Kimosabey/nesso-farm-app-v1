'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

export interface DonutSegment {
  label: string;
  v: number;
  color: string;
}

interface DonutProps {
  segments: DonutSegment[];
  total: number;
  center: string;
  sub: string;
  size?: number;
}

/**
 * Donut with rounded caps + center label and legend.
 * Matches web_viz.jsx `Donut` (recharts implementation).
 */
export function Donut({ segments, center, sub, size = 168 }: DonutProps) {
  const inner = size / 2 - 21;
  const outer = size / 2 - 7;

  return (
    <div className="flex flex-wrap items-center gap-[22px]">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={segments}
              dataKey="v"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={inner}
              outerRadius={outer}
              startAngle={90}
              endAngle={-270}
              paddingAngle={3}
              cornerRadius={7}
              stroke="none"
              isAnimationActive
            >
              {segments.map((s) => (
                <Cell key={s.label} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[30px] font-bold leading-none text-fg">
            {center}
          </span>
          <span className="mt-1 text-xs text-fg-muted">{sub}</span>
        </div>
      </div>
      <div className="flex min-w-[120px] flex-1 flex-col gap-[9px]">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-[9px]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-[13px] text-fg-muted">{s.label}</span>
            <span className="font-mono text-[13px] font-semibold text-fg">
              {s.v.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
