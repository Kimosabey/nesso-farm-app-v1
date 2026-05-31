'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Boxes, ChevronRight, Plus, Search } from 'lucide-react';
import type { InventoryBatch } from '@/lib/api';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusPill } from '@/components/dashboard/StatusPill';

export interface InventoryRow {
  id: string;
  batchId: string;
  product: string;
  qty: string;
  stage: string;
  warehouse: string;
  status: InventoryBatch['status'];
  updatedLabel: string;
}

export function toInventoryRow(b: InventoryBatch): InventoryRow {
  return {
    id: b._id,
    batchId: b.batchId,
    product: [b.productName, b.grade ?? b.variant].filter(Boolean).join(' · '),
    qty: `${b.quantity} ${b.unit}`,
    stage: b.currentStage,
    warehouse: b.warehouseName ?? '—',
    status: b.status,
    updatedLabel: new Date(b.incomingDate).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    }),
  };
}

const PILL_KIND: Record<InventoryBatch['status'], 'active' | 'processing' | 'approved' | 'pending'> = {
  AVAILABLE: 'active',
  PROCESSING: 'processing',
  SOLD: 'approved',
  TRANSFERRED: 'pending',
};

const STATUS_LABEL: Record<InventoryBatch['status'], string> = {
  AVAILABLE: 'Available',
  PROCESSING: 'Processing',
  SOLD: 'Sold',
  TRANSFERRED: 'Transferred',
};

const TABS = ['All', 'AVAILABLE', 'PROCESSING', 'SOLD', 'TRANSFERRED'] as const;
const TAB_LABEL: Record<string, string> = {
  All: 'All',
  AVAILABLE: 'Available',
  PROCESSING: 'Processing',
  SOLD: 'Sold',
  TRANSFERRED: 'Transferred',
};

interface Props {
  rows: InventoryRow[];
  total: number;
  page: number;
  totalPages: number;
  status?: string;
}

export function InventoryTable({ rows, total, page, totalPages, status }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.batchId.toLowerCase().includes(needle) ||
        r.product.toLowerCase().includes(needle) ||
        r.warehouse.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns = useMemo<ColumnDef<InventoryRow>[]>(
    () => [
      {
        id: 'batch',
        header: 'Batch',
        cell: ({ row }) => (
          <span className="font-mono text-[13px] font-semibold text-fg">
            {row.original.batchId}
          </span>
        ),
      },
      {
        id: 'product',
        header: 'Crop / grade',
        cell: ({ row }) => (
          <span className="text-[13.5px] text-fg-muted">{row.original.product}</span>
        ),
      },
      {
        id: 'qty',
        header: 'Qty',
        size: 100,
        cell: ({ row }) => (
          <span className="font-mono text-[13.5px] font-semibold text-fg">{row.original.qty}</span>
        ),
      },
      {
        id: 'stage',
        header: 'Stage',
        cell: ({ row }) => (
          <span className="text-[13.5px] text-fg-muted">{row.original.stage}</span>
        ),
      },
      {
        id: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) => (
          <span className="text-[13.5px] text-fg-muted">{row.original.warehouse}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusPill kind={PILL_KIND[row.original.status]}>
            {STATUS_LABEL[row.original.status]}
          </StatusPill>
        ),
      },
      {
        id: 'chevron',
        header: () => null,
        size: 50,
        cell: () => <ChevronRight size={17} className="text-fg-subtle" />,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  function goToTab(tab: string) {
    const qs = new URLSearchParams();
    if (tab !== 'All') qs.set('status', tab);
    router.push(qs.toString() ? `/inventory?${qs.toString()}` : '/inventory');
  }

  function goToPage(next: number) {
    const qs = new URLSearchParams();
    qs.set('page', String(next));
    if (status) qs.set('status', status);
    router.push(`/inventory?${qs.toString()}`);
  }

  const active = status ?? 'All';

  return (
    <div>
      <div className="mb-4 inline-flex flex-wrap gap-1 rounded-[12px] bg-bg-muted p-[3px]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => goToTab(t)}
            className={`rounded-[9px] px-3.5 py-1.5 text-[13px] font-semibold transition ${
              active === t ? 'bg-bg-elevated text-primary shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 min-w-[240px] max-w-[360px] flex-1 items-center gap-2.5 rounded-[11px] border border-border-strong bg-bg-elevated px-3.5">
          <Search size={17} className="text-fg-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search batches…"
            className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-border-strong px-3.5 text-[13px] font-semibold text-fg-muted transition hover:border-primary hover:text-primary"
        >
          <Plus size={15} /> Add filter
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] border-collapse">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-bg-muted">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      style={{ width: h.column.columnDef.size }}
                      className="whitespace-nowrap px-3.5 py-3 text-left text-[11.5px] font-bold uppercase tracking-[0.04em] text-fg-subtle"
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <EmptyState
                      icon={Boxes}
                      title={active === 'All' ? 'No inventory yet' : `No ${TAB_LABEL[active].toLowerCase()} batches`}
                      hint={
                        active === 'All'
                          ? 'Accept a GRN to create the first batch.'
                          : 'No batches match this filter.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/inventory/${row.original.id}`)}
                    className="cursor-pointer border-b border-l-2 border-border border-l-transparent transition-colors hover:border-l-primary hover:bg-bg-muted/60"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3.5 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-[18px] py-3.5">
          <span className="text-[13px] text-fg-muted">
            Showing <b className="text-fg">{filtered.length}</b> of {total.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="inline-flex h-8 items-center rounded-md border border-border-strong bg-bg-elevated px-3 text-[13px] font-medium text-fg transition hover:bg-bg-muted disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="inline-flex h-8 items-center rounded-md border border-border-strong bg-bg-elevated px-3 text-[13px] font-medium text-fg transition hover:bg-bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
