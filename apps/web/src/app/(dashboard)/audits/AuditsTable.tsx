'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import type { Audit } from '@/lib/api';
import { StatusPill } from '@/components/dashboard/StatusPill';

export interface AuditRow {
  id: string;
  auditType: Audit['auditType'];
  description: string;
  farmer: string;
  files: number;
  status: Audit['status'];
  dateLabel: string;
}

export function toAuditRow(a: Audit): AuditRow {
  return {
    id: a._id,
    auditType: a.auditType,
    description: a.description,
    farmer: a.farmerName ?? a.association ?? '—',
    files: a.attachments?.length ?? 0,
    status: a.status,
    dateLabel: new Date(a.auditDate).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  };
}

const PILL_KIND: Record<Audit['status'], 'approved' | 'pending' | 'rejected'> = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
};

const TABS = ['All', 'Pending', 'Approved', 'Rejected'] as const;

interface Props {
  rows: AuditRow[];
  total: number;
  page: number;
  totalPages: number;
  status?: string;
}

export function AuditsTable({ rows, total, page, totalPages, status }: Props) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.description.toLowerCase().includes(needle) ||
        r.farmer.toLowerCase().includes(needle) ||
        r.auditType.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns = useMemo<ColumnDef<AuditRow>[]>(
    () => [
      {
        id: 'audit',
        header: 'Audit',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={18} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-fg">
                {row.original.description}
              </div>
              <div className="truncate text-[11.5px] text-fg-subtle">
                {row.original.files} {row.original.files === 1 ? 'file' : 'files'}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="inline-flex rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
            {row.original.auditType}
          </span>
        ),
      },
      {
        id: 'farmer',
        header: 'Farmer / FPO',
        cell: ({ row }) => (
          <span className="text-[13.5px] text-fg-muted">{row.original.farmer}</span>
        ),
      },
      {
        id: 'date',
        header: 'Audit date',
        cell: ({ row }) => (
          <span className="text-[13px] text-fg-muted">{row.original.dateLabel}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusPill kind={PILL_KIND[row.original.status]}>{row.original.status}</StatusPill>
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
    router.push(qs.toString() ? `/audits?${qs.toString()}` : '/audits');
  }

  function goToPage(next: number) {
    const qs = new URLSearchParams();
    qs.set('page', String(next));
    if (status) qs.set('status', status);
    router.push(`/audits?${qs.toString()}`);
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
            placeholder="Search audits…"
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
                      ? 'No audits on record yet.'
                      : `No ${active.toLowerCase()} audits.`}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-l-2 border-border border-l-transparent transition-colors hover:border-l-primary hover:bg-bg-muted/60">
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
