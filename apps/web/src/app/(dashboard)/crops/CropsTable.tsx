'use client';

import { useMemo, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Leaf, Plus, Search, Sprout, X } from 'lucide-react';
import type { Crop, Farm, Farmer } from '@/lib/api';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { EmptyState } from '@/components/dashboard/EmptyState';

export interface CropRow {
  id: string;
  cropId: string;
  cropName: string;
  variety: string;
  farm: string;
  farmer: string;
  area: string;
  sowDate: string;
  harvestDate: string;
  status: string;
  statusKind: 'active' | 'approved' | 'pending';
}

export function toCropRow(
  c: Crop,
  farmById: Map<string, Farm>,
  farmerById: Map<string, Farmer>,
): CropRow {
  const farm = farmById.get(c.farmId);
  const farmer = farmerById.get(c.farmerId);
  const farmerName = farmer
    ? [farmer.firstName, farmer.lastName].filter(Boolean).join(' ').trim() || farmer.farmerId
    : '—';
  const now = Date.now();
  const harvested = c.harvestDate ? new Date(c.harvestDate).getTime() < now : false;
  const sown = c.sowingDate ? new Date(c.sowingDate).getTime() <= now : false;
  const status = harvested ? 'Harvested' : sown ? 'Growing' : 'Planned';
  const statusKind = harvested ? 'approved' : sown ? 'active' : 'pending';
  return {
    id: c._id,
    cropId: c.cropId,
    cropName: c.cropName,
    variety: c.cropVariety ?? '—',
    farm: farm?.farmName ?? '—',
    farmer: farmerName,
    area: `${c.acre ?? 0} ${c.unit ?? ''}`.trim(),
    sowDate: c.sowingDate ? new Date(c.sowingDate).toLocaleDateString() : '—',
    harvestDate: c.harvestDate ? new Date(c.harvestDate).toLocaleDateString() : '—',
    status,
    statusKind,
  };
}

interface Props {
  rows: CropRow[];
  total: number;
  query: string;
}

export function CropsTable({ rows, total, query }: Props) {
  const [q, setQ] = useState(query ?? '');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.cropName.toLowerCase().includes(needle) ||
        r.variety.toLowerCase().includes(needle) ||
        r.farm.toLowerCase().includes(needle) ||
        r.farmer.toLowerCase().includes(needle) ||
        r.cropId.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  const columns = useMemo<ColumnDef<CropRow>[]>(
    () => [
      {
        id: 'crop',
        header: 'Crop',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Leaf size={16} />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-fg">{row.original.cropName}</div>
              <div className="font-mono text-[11.5px] text-fg-subtle">{row.original.cropId}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'variety',
        header: 'Variety',
        cell: ({ row }) => (
          <span className="text-[13.5px] text-fg-muted">{row.original.variety}</span>
        ),
      },
      {
        id: 'farm',
        header: 'Farm',
        cell: ({ row }) => <span className="text-[13.5px] text-fg-muted">{row.original.farm}</span>,
      },
      {
        id: 'farmer',
        header: 'Farmer',
        cell: ({ row }) => (
          <span className="text-[13.5px] text-fg-muted">{row.original.farmer}</span>
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
        id: 'sow',
        header: 'Sow date',
        cell: ({ row }) => (
          <span className="text-[13px] text-fg-muted">{row.original.sowDate}</span>
        ),
      },
      {
        id: 'harvest',
        header: 'Harvest date',
        cell: ({ row }) => (
          <span className="text-[13px] text-fg-muted">{row.original.harvestDate}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusPill kind={row.original.statusKind}>{row.original.status}</StatusPill>
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

  return (
    <div>
      {/* filter builder */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 min-w-[240px] max-w-[360px] flex-1 items-center gap-2.5 rounded-[11px] border border-border-strong bg-bg-elevated px-3.5">
          <Search size={17} className="text-fg-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search crops…"
            className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>
        <FilterChip label="Season: Kharif" />
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
          <table className="w-full min-w-[860px] border-collapse">
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
                      icon={Sprout}
                      title="No crops yet"
                      hint="No crops match these filters. Try clearing the search."
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-l-2 border-border border-l-transparent transition-colors hover:border-l-primary hover:bg-bg-muted/60"
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
