import type { ReactNode } from 'react';

type Tone = 'primary' | 'warning' | 'success' | 'danger' | 'info' | 'muted';

const TONE_TEXT: Record<Tone, string> = {
  primary: 'text-primary',
  warning: 'text-warning',
  success: 'text-success',
  danger: 'text-danger',
  info: 'text-info',
  muted: 'text-fg',
};

const TONE_ICON: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/15 text-warning',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  muted: 'bg-bg-muted text-fg-muted',
};

/** Compact stat tile with optional icon — matches the web handoff `MiniStat`. */
export function MiniStat({
  label,
  value,
  tone = 'muted',
  icon,
  mono,
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {icon && (
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${TONE_ICON[tone]}`}>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <div className="truncate text-[11.5px] font-semibold uppercase tracking-wider text-fg-subtle">
            {label}
          </div>
          <div
            className={`mt-0.5 font-display text-2xl tabular-nums ${TONE_TEXT[tone]} ${
              mono ? 'font-mono text-[22px]' : ''
            }`}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
