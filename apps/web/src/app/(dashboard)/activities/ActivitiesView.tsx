'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bug,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Leaf,
  Scissors,
  Sprout,
  Tractor,
} from 'lucide-react';
import type { Activity } from '@/lib/api';
import { StatusPill } from '@/components/dashboard/StatusPill';

export interface ActivityRow {
  id: string;
  type: string;
  farm: string;
  farmer: string;
  detail: string;
  cost: string;
  dateISO: string;
  dateLabel: string;
  status: Activity['status'];
}

export function toActivityRow(
  a: Activity,
  farmName: string,
  farmerName: string,
): ActivityRow {
  const dateISO = a.completedDate ?? a.scheduledOn ?? a.enteredDate;
  const detail =
    a.inputs.map((i) => `${i.name} ${i.quantity}${i.unit ?? ''}`).join(', ') || a.notes || '—';
  return {
    id: a._id,
    type: a.activity,
    farm: farmName,
    farmer: farmerName,
    detail,
    cost: a.totalCost > 0 ? `₹${a.totalCost.toFixed(0)}` : '—',
    dateISO,
    dateLabel: new Date(dateISO).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
    status: a.status,
  };
}

const ACT_PILL: Record<Activity['status'], 'approved' | 'pending' | 'rejected' | 'processing'> = {
  Completed: 'approved',
  Pending: 'pending',
  Overdue: 'rejected',
  Cancelled: 'processing',
};

function typeIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('spray')) return <Bug size={15} />;
  if (t.includes('irrig')) return <Droplets size={15} />;
  if (t.includes('fertil')) return <Sprout size={15} />;
  if (t.includes('weed')) return <Scissors size={15} />;
  if (t.includes('harvest')) return <Tractor size={15} />;
  return <Leaf size={15} />;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DOT_COLORS = ['bg-primary', 'bg-secondary-700', 'bg-info', 'bg-warning', 'bg-accent'];

function dotColor(type: string) {
  let h = 0;
  for (let i = 0; i < type.length; i++) h = (h * 31 + type.charCodeAt(i)) >>> 0;
  return DOT_COLORS[h % DOT_COLORS.length]!;
}

interface Props {
  rows: ActivityRow[];
}

export function ActivitiesView({ rows }: Props) {
  const router = useRouter();
  const [view, setView] = useState<'Calendar' | 'List'>('List');

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2.5">
        <div className="inline-flex rounded-[10px] bg-bg-muted p-[3px]">
          {(['Calendar', 'List'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition ${
                view === v
                  ? 'bg-bg-elevated text-primary shadow-sm'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'Calendar' ? (
        <CalendarView rows={rows} />
      ) : (
        <ListView rows={rows} onOpen={() => router.push('/activities')} />
      )}
    </>
  );
}

function ListView({ rows, onOpen }: { rows: ActivityRow[]; onOpen: (id: string) => void }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-elevated p-12 text-center text-fg-muted shadow-sm">
        No activities logged yet.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-bg-muted">
              {['Activity', 'Farm', 'Farmer', 'Detail', 'Cost', 'Date', 'Status'].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3.5 py-3 text-left text-[11.5px] font-bold uppercase tracking-[0.04em] text-fg-subtle"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="group cursor-pointer border-b border-border transition hover:bg-bg-muted/50"
                onClick={() => onOpen(r.id)}
              >
                <td className="px-3.5 py-3 align-middle">
                  <span className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                      {typeIcon(r.type)}
                    </span>
                    <span className="text-sm font-semibold text-fg">{r.type}</span>
                  </span>
                </td>
                <td className="px-3.5 py-3 align-middle text-[13.5px] text-fg-muted">{r.farm}</td>
                <td className="px-3.5 py-3 align-middle text-[13.5px] text-fg-muted">
                  {r.farmer}
                </td>
                <td className="px-3.5 py-3 align-middle text-[13.5px] text-fg-muted">
                  {r.detail}
                </td>
                <td className="px-3.5 py-3 align-middle font-mono text-[13.5px] font-semibold text-fg">
                  {r.cost}
                </td>
                <td className="px-3.5 py-3 align-middle text-[13.5px] text-fg-muted">
                  {r.dateLabel}
                </td>
                <td className="px-3.5 py-3 align-middle">
                  <StatusPill kind={ACT_PILL[r.status]}>{r.status}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarView({ rows }: { rows: ActivityRow[] }) {
  const [offset, setOffset] = useState(0);
  const base = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + offset, 1);
  }, [offset]);

  const year = base.getFullYear();
  const month = base.getMonth();
  const monthLabel = base.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // activities indexed by day-of-month for this view's month
  const byDay = useMemo(() => {
    const map = new Map<number, ActivityRow[]>();
    for (const r of rows) {
      const d = new Date(r.dateISO);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(r);
      }
    }
    return map;
  }, [rows, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first leading blanks
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => i - firstDow + 1);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-[17px] font-bold text-fg">{monthLabel}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setOffset((o) => o - 1)}
            className="grid h-8 w-8 place-items-center rounded-md border border-border-strong bg-bg-elevated text-fg transition hover:bg-bg-muted"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setOffset((o) => o + 1)}
            className="grid h-8 w-8 place-items-center rounded-md border border-border-strong bg-bg-elevated text-fg transition hover:bg-bg-muted"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[11.5px] font-bold text-fg-subtle"
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          const valid = day >= 1 && day <= daysInMonth;
          const acts = valid ? byDay.get(day) ?? [] : [];
          const isToday = valid && isCurrentMonth && day === today.getDate();
          return (
            <div
              key={i}
              className={`min-h-[74px] rounded-[10px] border p-1.5 ${
                isToday
                  ? 'border-primary/30 bg-primary/10'
                  : valid
                    ? 'border-border bg-bg-elevated'
                    : 'border-transparent opacity-30'
              }`}
            >
              {valid && (
                <div
                  className={`text-[12px] ${
                    isToday ? 'font-bold text-primary' : 'font-medium text-fg-muted'
                  }`}
                >
                  {day}
                </div>
              )}
              <div className="mt-1 flex flex-col gap-1">
                {acts.slice(0, 2).map((a) => (
                  <span
                    key={a.id}
                    title={`${a.type} · ${a.farm}`}
                    className={`truncate rounded px-1.5 py-0.5 text-[9.5px] font-semibold text-primary-fg ${dotColor(
                      a.type,
                    )}`}
                  >
                    {a.type}
                  </span>
                ))}
                {acts.length > 2 && (
                  <span className="text-[9.5px] font-semibold text-fg-subtle">
                    +{acts.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
