'use client';

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from 'recharts';

export interface BarDatum {
  k: string;
  v: number;
  hi?: boolean;
}

interface BarsProps {
  data: BarDatum[];
  color?: string;
  accent?: string;
  h?: number;
}

/**
 * Bar chart — rounded caps, no axis lines, highlighted bar in accent.
 * Matches web_viz.jsx `Bars` (recharts implementation).
 */
export function Bars({ data, color = '#0D783C', accent = '#F1D412', h = 200 }: BarsProps) {
  return (
    <div style={{ height: h, width: '100%', minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} barCategoryGap="28%">
          <XAxis
            dataKey="k"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'rgb(var(--fg-subtle))', fontWeight: 500 }}
            dy={2}
          />
          <Bar dataKey="v" radius={[999, 999, 999, 999]} maxBarSize={30} isAnimationActive>
            {data.map((d) => (
              <Cell key={d.k} fill={d.hi ? accent : color} fillOpacity={d.hi ? 1 : 0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
