'use client';

import { Download, FileSpreadsheet } from 'lucide-react';

/** Export buttons — stubs until the BullMQ export pipeline lands. */
export function ExportButtons() {
  return (
    <>
      <button
        type="button"
        title="CSV export — coming soon"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3.5 text-sm font-medium text-fg shadow-sm transition hover:bg-bg-muted"
      >
        <Download size={16} /> CSV
      </button>
      <button
        type="button"
        title="XLSX export — coming soon"
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3.5 text-sm font-medium text-fg shadow-sm transition hover:bg-bg-muted"
      >
        <FileSpreadsheet size={16} /> XLSX
      </button>
    </>
  );
}
