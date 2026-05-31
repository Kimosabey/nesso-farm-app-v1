'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, ExternalLink } from 'lucide-react';
import { TraceQr, traceCodeFromBatch } from '@/components/dashboard/TraceQr';

export interface BatchOption {
  id: string;
  batchId: string;
  label: string;
}

const SIZES = ['40mm', '60mm', '80mm'] as const;
const LOCALE = 'en';

export function QrGenerator({ batches }: { batches: BatchOption[] }) {
  const hasBatches = batches.length > 0;
  const [batchId, setBatchId] = useState(hasBatches ? batches[0]!.batchId : '');
  const [manual, setManual] = useState('');
  const [size, setSize] = useState<(typeof SIZES)[number]>('60mm');

  const effectiveBatch = (hasBatches ? batchId : manual).trim();
  const code = effectiveBatch ? traceCodeFromBatch(effectiveBatch) : '';
  const tracePath = code ? `/${LOCALE}/t/${code}` : '';

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      {/* Settings */}
      <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
        <h2 className="mb-4 font-display text-[15px] font-bold text-fg">Label settings</h2>
        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-fg-muted">Batch</span>
            {hasBatches ? (
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="h-11 w-full rounded-xl border border-border-strong bg-bg-elevated px-3.5 text-sm text-fg"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.batchId}>
                    {b.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="BATCH-TBR-0291"
                className="h-11 w-full rounded-xl border border-border-strong bg-bg-elevated px-3.5 text-sm text-fg placeholder:text-fg-subtle"
              />
            )}
            {!hasBatches && (
              <span className="mt-1.5 block text-xs text-fg-subtle">
                No inventory batches found — enter a batch code to generate a label.
              </span>
            )}
          </label>

          <div>
            <span className="mb-2 block text-[13px] font-semibold text-fg-muted">Label size</span>
            <div className="flex gap-2">
              {SIZES.map((s) => {
                const on = s === size;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                      on
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-bg-elevated text-fg-muted hover:bg-bg-muted'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={!code}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Stub — wire to label-PDF service"
          >
            <Download size={16} /> Generate &amp; download
          </button>
          <p className="text-xs text-fg-subtle">
            Download produces a print-ready label PDF (coming soon).
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
        <div className="mb-4 text-[11.5px] font-bold uppercase tracking-[0.08em] text-fg-subtle">
          Preview
        </div>
        {code ? (
          <>
            <div className="rounded-2xl bg-white p-5 text-center shadow-md">
              <TraceQr code={code} size={180} />
              <div className="mt-3 font-mono text-xs font-semibold text-[#0F1A14]">
                {effectiveBatch}
              </div>
              <div className="mt-0.5 text-[10px] text-[#4A5A52]">nesso.in{tracePath}</div>
            </div>
            <div className="mt-5 w-full max-w-xs text-center">
              <p className="text-xs uppercase tracking-wider text-fg-subtle">Public trace link</p>
              <Link
                href={tracePath}
                className="mt-1 inline-flex items-center gap-1.5 break-all font-mono text-sm text-primary hover:underline"
              >
                {tracePath} <ExternalLink size={14} />
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-fg-muted">Enter a batch code to preview its label.</p>
        )}
      </div>
    </div>
  );
}
