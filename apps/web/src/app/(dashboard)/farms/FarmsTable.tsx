'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronRight, Plus, Search, X } from 'lucide-react';
import type { Farm, Farmer } from '@/lib/api';
import { StatusPill } from '@/components/dashboard/StatusPill';

export interface FarmRow {
  id: string;
  farmId: string;
  farmName: string;
  farmer: string;
  village: string;
  taluka: string;
  area: string;
  practice: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function toFarmRow(f: Farm, farmerById: Map<string, Farmer>): FarmRow {
  const farmer = farmerById.get(f.farmerId);
  const farmerName = farmer
    ? [farmer.firstName, farmer.lastName].filter(Boolean).join(' ').trim() || farmer.farmerId
    : '—';
  return {
    id: f._id,
    farmId: f.farmId,
    farmName: f.farmName,
    farmer: farmerName,
    village: f.address?.village ?? '—',
    taluka: f.address?.district ?? '—',
    area: `${(f.farmArea ?? 0).toFixed(1)} ac`,
    practice: f.organicStage ?? '—',
    status: f.approvalStatus,
  };
}

const STATUS_LABEL: Record<FarmRow['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

interface Props {
  rows: FarmRow[];
  total: number;
  page: number;
  totalPages: number;
  query: string;
}

export function FarmsTable({ rows, total, page, totalPages, query }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(query ?? '');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.farmName.toLowerCase().includes(needle) ||
        r.farmer.toLowerCase().includes(needle) ||
        r.village.toLowerCase().includes(needle) ||
        r.farmId.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns = useMemo<ColumnDef<FarmRow>[]>(
    () => [
      {
        id: 'farm',
        header: 'Farm',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-fg">{row.original.farmName}</div>
            <div className="font-mono text-[11.5px] text-fg-subtle">{row.original.farmId}</div>
          </div>
        ),
      },
      {
        id: 'farmer',
        header: 'Farmer',
        cell: ({ row }) => (
          <span className="text-[13.5px] text-fg-muted">{row.original.farmer}</span>
        ),
      },
      {
        id: 'location',
        header: 'Village / Taluka',
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-[13.5px] text-fg">{row.original.village}</div>
            <div className="truncate text-[11.5px] text-fg-subtle">{row.original.taluka}</div>
          </div>
        ),
      },
      {
        id: 'area',
        header: 'Area',
        size: 90,
        cell: ({ row }) => (
          <span className="font-mono text-[13.5px] text-fg">{row.original.area}</span>
        ),
      },
      {
        id: 'practice',
        header: 'Practice',
        cell: ({ row }) =>
          row.original.practice === '—' ? (
            <span className="text-sm text-fg-subtle">—</span>
          ) : (
            <span className="inline-flex rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs font-semibold text-secondary-700">
              {row.original.practice}
            </span>
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
    router.push(`/farms?${qs.toString()}`);
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
            placeholder="Search farms…"
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
                  <td colSpan={columns.length} className="px-4 py-16 text-center text-fg-muted">
                    No farms match these filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/farms/${row.original.id}`)}
                    className="group cursor-pointer border-b border-border transition hover:bg-bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell, i) => (
                      <td
                        key={cell.id}
                        className={`relative px-3.5 py-3 align-middle ${
                          i === 0
                            ? 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary before:opacity-0 group-hover:before:opacity-100'
                            : ''
                        }`}
                      >
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
