'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
import type { Procurement } from '@/lib/api';
import { Avatar } from '@/components/dashboard/Avatar';
import { StatusPill } from '@/components/dashboard/StatusPill';

export interface ProcurementRow {
  id: string;
  ref: string;
  payee: string;
  crop: string;
  qty: string;
  amount: string;
  payStatus: Procurement['paymentStatus'];
  status: Procurement['status'];
  dateLabel: string;
}

export function toProcurementRow(p: Procurement): ProcurementRow {
  return {
    id: p._id,
    ref: p.procurementId,
    payee: p.farmerName ?? '—',
    crop: [p.crop, p.variety].filter(Boolean).join(' · '),
    qty: `${p.quantity} ${p.unit}`,
    amount: `₹${Math.round(p.totalAmount).toLocaleString('en-IN')}`,
    payStatus: p.paymentStatus,
    status: p.status,
    dateLabel: new Date(p.procurementDate).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

const PAY_KIND: Record<Procurement['paymentStatus'], 'approved' | 'pending' | 'rejected'> = {
  Paid: 'approved',
  Partial: 'pending',
  Unpaid: 'rejected',
};

const PAY_LABEL: Record<Procurement['paymentStatus'], string> = {
  Paid: 'Paid',
  Partial: 'Partial',
  Unpaid: 'Payment due',
};

const TABS = ['All', 'Pending', 'Completed', 'Cancelled'] as const;

interface Props {
  rows: ProcurementRow[];
  total: number;
  page: number;
  totalPages: number;
  status?: string;
}

export function ProcurementTable({ rows, total, page, totalPages, status }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.payee.toLowerCase().includes(needle) ||
        r.crop.toLowerCase().includes(needle) ||
        r.ref.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns = useMemo<ColumnDef<ProcurementRow>[]>(
    () => [
      {
        id: 'ref',
        header: 'Ref',
        cell: ({ row }) => (
          <span className="font-mono text-[13px] text-fg-muted">{row.original.ref}</span>
        ),
      },
      {
        id: 'payee',
        header: 'Payee',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.payee} size={32} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-fg">{row.original.payee}</div>
              <div className="truncate text-[11.5px] text-fg-subtle">{row.original.crop}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'qty',
        header: 'Quantity',
        cell: ({ row }) => (
          <span className="font-mono text-[13.5px] text-fg-muted">{row.original.qty}</span>
        ),
      },
      {
        id: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-mono text-[14px] font-semibold text-fg">{row.original.amount}</span>
        ),
      },
      {
        id: 'pay',
        header: 'Payment',
        cell: ({ row }) => (
          <StatusPill kind={PAY_KIND[row.original.payStatus]}>
            {PAY_LABEL[row.original.payStatus]}
          </StatusPill>
        ),
      },
      {
        id: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-[13px] text-fg-muted">{row.original.dateLabel}</span>
        ),
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
    router.push(qs.toString() ? `/procurement?${qs.toString()}` : '/procurement');
  }

  function goToPage(next: number) {
    const qs = new URLSearchParams();
    qs.set('page', String(next));
    if (status) qs.set('status', status);
    router.push(`/procurement?${qs.toString()}`);
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
            {t}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 min-w-[240px] max-w-[360px] flex-1 items-center gap-2.5 rounded-[11px] border border-border-strong bg-bg-elevated px-3.5">
          <Search size={17} className="text-fg-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by payee or ref…"
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
          <table className="w-full min-w-[680px] border-collapse">
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
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-fg-muted">
                    {active === 'All'
                      ? 'No procurement orders yet.'
                      : `No ${active.toLowerCase()} procurements.`}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border transition hover:bg-bg-muted/50">
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
