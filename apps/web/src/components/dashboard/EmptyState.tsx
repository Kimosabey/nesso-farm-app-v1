import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Centered empty-state card — tinted icon circle, title, hint, optional CTA.
 * Token classes only (auto dark/light).
 */
export function EmptyState({ icon: Icon, title, hint, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 text-base font-semibold text-fg">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-sm text-fg-muted">{hint}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
