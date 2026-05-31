'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronRight, Plus, Search, Users, X } from 'lucide-react';
import { Avatar } from '@/components/dashboard/Avatar';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatusPill } from '@/components/dashboard/StatusPill';

export interface FarmerRow {
  id: string;
  farmerId: string;
  name: string;
  village: string;
  district: string;
  crop: string;
  status: 'pending' | 'approved' | 'rejected';
  kyc: string;
}

const STATUS_LABEL: Record<FarmerRow['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

interface Props {
  rows: FarmerRow[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
  status?: string;
  association?: string;
}

export function FarmersTable({ rows, total, page, totalPages, query, status, association }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(query ?? '');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.village.toLowerCase().includes(needle) ||
        r.farmerId.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns = useMemo<ColumnDef<FarmerRow>[]>(
    () => [
      {
        id: 'farmer',
        header: 'Farmer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar name={row.original.name} size={34} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-fg">{row.original.name}</div>
              <div className="font-mono text-[11.5px] text-fg-subtle">{row.original.village}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'farmerId',
        header: 'Farmer ID',
        cell: ({ row }) => (
          <span className="font-mono text-[13px] text-fg-muted">{row.original.farmerId}</span>
        ),
      },
      {
        id: 'crop',
        header: 'Crops',
        cell: ({ row }) =>
          row.original.crop === '—' ? (
            <span className="text-sm text-fg-subtle">—</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {row.original.crop.split(', ').map((c) => (
                <span
                  key={c}
                  className="inline-flex rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-700"
                >
                  {c}
                </span>
              ))}
            </div>
          ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusPill kind={row.original.status}>{STATUS_LABEL[row.original.status]}</StatusPill>
        ),
      },
      {
        id: 'kyc',
        header: 'KYC',
        cell: ({ row }) => (
          <span
            className={`text-[13px] ${row.original.kyc === 'Failed' ? 'text-danger' : 'text-fg-muted'}`}
          >
            {row.original.kyc}
          </span>
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

  function goToPage(next: number) {
    const qs = new URLSearchParams();
    qs.set('page', String(next));
    if (query) qs.set('q', query);
    if (status) qs.set('status', status);
    if (association) qs.set('association', association);
    router.push(`/farmers?${qs.toString()}`);
  }

  return (
    <div>
      {/* filter builder */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 min-w-[240px] max-w-[360px] flex-1 items-center gap-2.5 rounded-[11px] border border-border-strong bg-bg-elevated px-3.5">
          <Search size={17} className="text-fg-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search farmers…"
            className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>
        <FilterChip label="District: Hassan" />
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-border-strong px-3.5 text-[13px] font-semibold text-fg-muted transition hover:border-primary hover:text-primary"
        >
          <Plus size={15} /> Add filter
        </button>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
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
                      icon={Users}
                      title="No farmers found"
                      hint="No farmers match these filters. Try clearing the search or filters."
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/farmers/${row.original.id}`)}
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

        {/* footer pagination */}
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

function FilterChip({ label }: { label: string }) {
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  return (
    <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary/10 py-0 pl-3 pr-2 text-[13px] font-semibold text-primary">
      {label}
      <button
        type="button"
        aria-label={`Remove filter ${label}`}
        onClick={() => setShown(false)}
        className="grid place-items-center text-primary"
      >
        <X size={15} />
      </button>
    </span>
  );
}
