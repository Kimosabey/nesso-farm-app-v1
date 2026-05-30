import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  sub?: string;
  actions?: ReactNode;
}

/**
 * Editorial page header — title + sub + right-aligned actions.
 * Matches web_pages.jsx `PageHeader`.
 */
export function PageHeader({ title, sub, actions }: PageHeaderProps) {
  return (
    <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[clamp(24px,3vw,32px)] font-bold tracking-tight text-fg">
          {title}
        </h1>
        {sub && <p className="mt-[5px] text-[14.5px] text-fg-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}
