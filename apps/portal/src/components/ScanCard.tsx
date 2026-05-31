'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ScanLine } from 'lucide-react';

/**
 * Deterministic QR-like SVG pattern (decorative). Mirrors the design handoff's
 * inline QR illustration — finder squares in three corners + a pseudo-random
 * module field so it reads as a real code without encoding anything.
 */
function QrIllustration() {
  const cells: Array<{ x: number; y: number }> = [];
  const n = 14;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const onModule = (x * 7 + y * 13 + x * y) % 3 === 0;
      const finder = (x < 3 && y < 3) || (x > 10 && y < 3) || (x < 3 && y > 10);
      if (onModule || finder) cells.push({ x, y });
    }
  }
  const s = 100 / n;
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="crispEdges" aria-hidden>
      {cells.map(({ x, y }) => (
        <rect
          key={`${x}-${y}`}
          x={x * s + 1}
          y={y * s + 1}
          width={s - 1}
          height={s - 1}
          fill="#0F1A14"
        />
      ))}
    </svg>
  );
}

const SAMPLE_CODE = 'SAMPLE12';

/** Landing scan card: QR illustration + batch-code input → /{locale}/t/{code}. */
export function ScanCard({ locale = 'en' }: { locale?: string }) {
  const router = useRouter();
  const [code, setCode] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/${locale}/t/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="relative z-10 mx-auto mt-9 max-w-[420px] rounded-[22px] border border-border bg-bg-elevated p-7 shadow-lg">
      <div className="mx-auto size-[120px] rounded-2xl bg-white p-3 shadow-sm">
        <QrIllustration />
      </div>

      <p className="mt-4 text-sm text-fg-muted">
        Point your phone camera at a Nesso label, or enter a batch code below.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2.5">
        <div className="flex items-stretch gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter a batch code"
            aria-label="Batch code"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="h-12 flex-1 rounded-xl border border-border bg-bg px-4 font-mono text-[15px] uppercase tracking-wide text-fg placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-fg-subtle focus-visible:border-primary"
          />
          <button
            type="submit"
            aria-label="Trace this batch"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-fg shadow-md transition hover:bg-primary-700 disabled:opacity-50"
            disabled={!code.trim()}
          >
            <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/${locale}/t/${SAMPLE_CODE}`)}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-strong bg-bg-elevated px-6 font-display text-[14.5px] font-semibold text-fg transition hover:bg-bg-muted"
        >
          <ScanLine className="size-[18px]" aria-hidden />
          See a sample trace
        </button>
      </form>
    </div>
  );
}
