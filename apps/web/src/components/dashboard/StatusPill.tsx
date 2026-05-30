import type { ReactNode } from 'react';

type Kind =
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'active'
  | 'processing';

const KINDS: Record<Kind, string> = {
  approved: 'bg-primary/10 text-primary border-primary/20',
  active: 'bg-primary/10 text-primary border-primary/20',
  pending: 'bg-warning/15 text-warning border-warning/30',
  rejected: 'bg-danger/10 text-danger border-danger/30',
  processing: 'bg-info/10 text-info border-info/30',
};

/** Pill matching the web handoff `StatusPill`. */
export function StatusPill({ kind, children }: { kind: Kind; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${KINDS[kind]}`}
    >
      {children}
    </span>
  );
}
