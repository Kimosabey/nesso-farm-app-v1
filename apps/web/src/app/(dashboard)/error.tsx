'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, LayoutGrid, RotateCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="grid min-h-[70vh] place-items-center px-6 py-12 text-center">
      <div className="max-w-md">
        <div className="relative mx-auto mb-6 inline-block">
          <span className="select-none font-display text-[120px] font-bold leading-none tracking-tighter text-bg-muted">
            500
          </span>
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[18px] bg-danger/10 text-danger">
            <AlertTriangle size={32} />
          </span>
        </div>
        <h1 className="font-display text-[26px] font-bold text-fg">Something went wrong</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-fg-muted">
          An unexpected error occurred. Our team has been notified
          {error.digest ? (
            <>
              {' '}
              · <span className="font-mono text-xs text-fg-subtle">{error.digest}</span>
            </>
          ) : null}
          .
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
          >
            <RotateCw size={16} /> Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 text-sm font-medium text-fg shadow-sm transition hover:bg-bg-muted"
          >
            <LayoutGrid size={16} /> Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
