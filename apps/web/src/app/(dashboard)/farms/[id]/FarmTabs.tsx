'use client';

import { useState } from 'react';
import { Activity as ActivityIcon, CloudRain, Leaf, ShieldCheck, Sprout } from 'lucide-react';
import type { Activity, Crop, WeatherSnapshot } from '@/lib/api';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { EmptyState } from '@/components/dashboard/EmptyState';

const TABS = ['Crops', 'Activities', 'Weather', 'Certificates', 'Soil'] as const;
type Tab = (typeof TABS)[number];

interface Props {
  crops: Crop[];
  activities: Activity[];
  weather: WeatherSnapshot | null;
  soil?: string;
}

export function FarmTabs({ crops, activities, weather, soil }: Props) {
  const [tab, setTab] = useState<Tab>('Crops');

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
      <div className="px-[18px] pt-1.5">
        <div className="flex gap-1 overflow-x-auto border-b border-border">
          {TABS.map((t) => {
            const on = t === tab;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm transition ${
                  on
                    ? 'border-primary font-semibold text-primary'
                    : 'border-transparent font-medium text-fg-muted hover:text-fg'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5">
        {tab === 'Crops' && <CropsTab crops={crops} />}
        {tab === 'Activities' && <ActivitiesTab activities={activities} />}
        {tab === 'Weather' && <WeatherTab weather={weather} />}
        {tab === 'Certificates' && <CertificatesTab />}
        {tab === 'Soil' && <SoilTab soil={soil} />}
      </div>
    </div>
  );
}

function fmtDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '—';
}

function CropsTab({ crops }: { crops: Crop[] }) {
  if (crops.length === 0) {
    return (
      <EmptyState
        icon={Sprout}
        title="No crops yet"
        hint="Crops grown on this farm will appear here."
        actionLabel="Add crop"
        actionHref="/crops"
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {crops.map((c) => (
        <div
          key={c._id}
          className="flex items-center gap-3.5 rounded-2xl border border-border p-3.5"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Leaf size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold text-fg">{c.cropName}</div>
            <div className="text-[12.5px] text-fg-muted">
              {[c.cropVariety, c.sowingDate ? `Sown ${fmtDate(c.sowingDate)}` : null]
                .filter(Boolean)
                .join(' · ') || c.cropType}
            </div>
          </div>
          <StatusPill kind="active">{c.season || c.cropType}</StatusPill>
        </div>
      ))}
    </div>
  );
}

const ACT_PILL: Record<Activity['status'], 'approved' | 'pending' | 'rejected' | 'processing'> = {
  Completed: 'approved',
  Pending: 'pending',
  Overdue: 'rejected',
  Cancelled: 'processing',
};

function ActivitiesTab({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={ActivityIcon}
        title="No activities logged"
        hint="Field operations logged for this farm will appear here."
        actionLabel="Log activity"
        actionHref="/activities/new"
      />
    );
  }
  return (
    <ol className="relative ml-2 border-l border-border">
      {activities.map((a) => {
        const date = a.completedDate ?? a.scheduledOn ?? a.enteredDate;
        return (
          <li key={a._id} className="relative ml-5 pb-5 last:pb-0">
            <span className="absolute -left-[26px] top-1 grid h-3 w-3 place-items-center rounded-full border-2 border-bg-elevated bg-primary" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{a.activity}</span>
              <StatusPill kind={ACT_PILL[a.status]}>{a.status}</StatusPill>
            </div>
            <div className="mt-0.5 text-[12.5px] text-fg-muted">
              {[
                a.totalCost > 0 ? `₹${a.totalCost.toFixed(0)}` : null,
                ...a.inputs.map((i) => `${i.name} ${i.quantity}${i.unit ?? ''}`),
              ]
                .filter(Boolean)
                .join(' · ') || a.notes || '—'}
            </div>
            <div className="mt-0.5 font-mono text-[11.5px] text-fg-subtle">
              {new Date(date).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function WeatherTab({ weather }: { weather: WeatherSnapshot | null }) {
  if (!weather) {
    return (
      <EmptyState
        icon={CloudRain}
        title="Weather unavailable"
        hint="The farm may not have GPS set, or the forecast service timed out."
      />
    );
  }
  return (
    <div>
      <div className="mb-4 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-secondary to-primary p-4 text-primary-fg">
        <CloudRain size={40} strokeWidth={1.6} />
        <div className="flex-1">
          <div className="font-display text-3xl font-bold tabular-nums">
            {Math.round(weather.current.tempC)}°
          </div>
          <div className="text-[13px] opacity-90">
            {weather.current.description ?? 'Current conditions'}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-2.5">
        {weather.daily.slice(0, 7).map((d, i) => (
          <div
            key={d.date}
            className="rounded-xl border border-border px-1 py-3 text-center"
          >
            <div className="text-[12px] text-fg-muted">
              {i === 0
                ? 'Today'
                : new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
            </div>
            <div className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-fg">
              {Math.round(d.maxC)}°
            </div>
            <div className="font-mono text-[11px] tabular-nums text-fg-subtle">
              {Math.round(d.minC)}°
            </div>
          </div>
        ))}
      </div>
      {weather.advisories.length > 0 ? (
        <ul className="mt-4 space-y-1.5">
          {weather.advisories.map((a, i) => (
            <li
              key={i}
              className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-fg"
            >
              {a}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CertificatesTab() {
  const certs: Array<[string, string, 'approved' | 'pending']> = [
    ['India Organic', 'Valid till Mar 2027', 'approved'],
    ['GAP — Good Agri Practice', 'Valid till Jan 2027', 'approved'],
    ['Residue test', 'Renewal due', 'pending'],
  ];
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
      {certs.map(([name, detail, kind]) => (
        <div key={name} className="rounded-2xl border border-border p-4">
          <span className="mb-3 grid h-10 w-10 place-items-center rounded-[11px] bg-primary/10 text-primary">
            <ShieldCheck size={20} />
          </span>
          <div className="text-sm font-semibold text-fg">{name}</div>
          <div className="my-1.5 text-xs text-fg-muted">{detail}</div>
          <StatusPill kind={kind}>{kind === 'approved' ? 'Active' : 'Renew soon'}</StatusPill>
        </div>
      ))}
    </div>
  );
}

function SoilTab({ soil }: { soil?: string }) {
  const rows: Array<[string, string]> = [
    ['Type', soil ?? 'Red loam'],
    ['pH', '6.8'],
    ['Organic carbon', '0.62%'],
    ['Nitrogen', 'Medium'],
    ['Phosphorus', 'High'],
    ['Potassium', 'Medium'],
    ['Last tested', '14 Apr 2026'],
    ['EC', '0.4 dS/m'],
  ];
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-xl border border-border bg-bg-elevated p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-fg-subtle">
            {k}
          </div>
          <div className="mt-1 font-display text-[17px] font-bold text-fg">{v}</div>
        </div>
      ))}
    </div>
  );
}
