'use client';

import type { LucideIcon } from 'lucide-react';
import { Sparkline } from './charts/Sparkline';
import { useCountUp } from './useCountUp';

interface KpiWProps {
  label: string;
  value: number;
  suffix?: string;
  delta?: number;
  Icon: LucideIcon;
  /** Series colour (hex or CSS color) for icon tile, spark + delta. */
  color: string;
  spark?: number[];
}

/**
 * KPI bento tile — count-up value + sparkline. Matches web_viz.jsx `KpiW`.
 */
export function KpiW({ label, value, suffix = '', delta, Icon, color, spark }: KpiWProps) {
  const v = useCountUp(value);
  const disp = value >= 100 ? Math.round(v).toLocaleString() : v.toFixed(0);

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <span
          className="grid h-[34px] w-[34px] place-items-center rounded-[11px]"
          style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
        >
          <Icon size={18} strokeWidth={2} />
        </span>
        {spark && <Sparkline data={spark} color={color} w={60} h={24} />}
      </div>
      <div
        className="mt-3.5 font-display text-[30px] font-bold tracking-tight tabular-nums text-fg"
      >
        {disp}
        {suffix}
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="text-[13.5px] font-medium text-fg-muted">{label}</span>
        {delta != null && (
          <span
            className="inline-flex items-center gap-0.5 text-xs font-bold"
            style={{ color: delta > 0 ? '#0D783C' : '#B42318' }}
          >
            {delta > 0 ? '↑' : '↓'}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}
