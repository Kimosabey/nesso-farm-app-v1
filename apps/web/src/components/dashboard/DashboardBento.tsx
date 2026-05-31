'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Box,
  Clock,
  Cloud,
  MapPin,
  Sprout,
  Users,
  Activity as ActivityIcon,
  type LucideIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { KpiW } from './KpiW';
import { MiniMap } from './charts/MiniMap';

// Code-split recharts (~90KB gzip) out of the initial dashboard bundle.
// Charts are below the fold / client-only; a sized shimmer holds layout
// so there's no CLS while the chunk streams in.
const ChartShimmer = ({ h = 168 }: { h?: number }) => (
  <div
    className="w-full animate-pulse rounded-xl bg-surface-muted"
    style={{ height: h }}
    aria-hidden
  />
);
const Donut = dynamic(() => import('./charts/Donut').then((m) => m.Donut), {
  ssr: false,
  loading: () => <ChartShimmer h={168} />,
});
const Bars = dynamic(() => import('./charts/Bars').then((m) => m.Bars), {
  ssr: false,
  loading: () => <ChartShimmer h={200} />,
});

const PRIMARY = '#0D783C';
const SECONDARY_D = '#3C6B51';
const INFO = '#0E7490';
const WARNING = '#9A8407';
const ACCENT = '#F1D412';
const DANGER = '#B42318';
const GRN = '#B6850A';

export interface FeedItem {
  icon: keyof typeof FEED_ICONS;
  color: string;
  title: string;
  subtitle: string;
  time: string;
}

interface DashboardBentoProps {
  farmersTotal: number;
  pendingTotal: number;
  feed: FeedItem[];
}

export function DashboardBento({ farmersTotal, pendingTotal, feed }: DashboardBentoProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Row 1 — KPIs */}
      <KpiW
        label="Farmers"
        value={farmersTotal}
        delta={12}
        Icon={Users}
        color={PRIMARY}
        spark={[3, 5, 4, 6, 7, 8, 10, 11]}
      />
      <KpiW
        label="Farms mapped"
        value={942}
        delta={8}
        Icon={MapPin}
        color={SECONDARY_D}
        spark={[2, 3, 3, 5, 6, 6, 8, 9]}
      />
      <KpiW
        label="Active crops"
        value={376}
        delta={5}
        Icon={Sprout}
        color={INFO}
        spark={[5, 4, 5, 6, 6, 7, 7, 8]}
      />
      <KpiW
        label="Pending approvals"
        value={pendingTotal}
        delta={-4}
        Icon={Clock}
        color={WARNING}
        spark={[8, 7, 6, 7, 5, 5, 4, 3]}
      />

      {/* Map — c2 r2 */}
      <div className="flex flex-col rounded-2xl border border-border bg-bg-elevated shadow-sm sm:col-span-2 xl:row-span-2">
        <div className="flex items-center justify-between px-5 pb-3 pt-[18px]">
          <div>
            <h3 className="font-display text-base font-bold text-fg">Farm distribution</h3>
            <p className="text-[12.5px] text-fg-muted">942 farms · 5 talukas</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-fg-muted transition hover:bg-bg-muted hover:text-fg"
          >
            Open map <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="min-h-[260px] flex-1 px-4 pb-4">
          <MiniMap />
        </div>
      </div>

      {/* Activity progress donut — c2 */}
      <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:col-span-2">
        <h3 className="mb-4 font-display text-base font-bold text-fg">Activity progress</h3>
        <Donut
          center="68%"
          sub="complete"
          total={100}
          segments={[
            { label: 'Completed', v: 68, color: PRIMARY },
            { label: 'In progress', v: 21, color: ACCENT },
            { label: 'Overdue', v: 11, color: DANGER },
          ]}
        />
      </div>

      {/* Activities bar — c2 */}
      <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:col-span-2">
        <div className="mb-[18px] flex items-baseline justify-between">
          <h3 className="font-display text-base font-bold text-fg">Activities logged</h3>
          <span className="text-[12.5px] text-fg-muted">last 6 months</span>
        </div>
        <Bars
          data={[
            { k: 'Dec', v: 120 },
            { k: 'Jan', v: 180 },
            { k: 'Feb', v: 150 },
            { k: 'Mar', v: 240 },
            { k: 'Apr', v: 300, hi: true },
            { k: 'May', v: 210 },
          ]}
        />
      </div>

      {/* Farmer associations donut — c2 */}
      <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:col-span-2">
        <h3 className="mb-4 font-display text-base font-bold text-fg">Farmer associations</h3>
        <Donut
          center="1,284"
          sub="farmers"
          total={1284}
          segments={[
            { label: 'FPO', v: 642, color: PRIMARY },
            { label: 'Flower agent', v: 388, color: SECONDARY_D },
            { label: 'Independent', v: 254, color: INFO },
          ]}
        />
      </div>

      {/* Recent activity — c2 */}
      <div className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:col-span-2">
        <div className="mb-1.5 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-fg">Recent activity</h3>
          <Link
            href="/activities"
            className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-fg-muted transition hover:bg-bg-muted hover:text-fg"
          >
            See all
          </Link>
        </div>
        {feed.map((f, i) => (
          <FeedRow key={i} item={f} last={i === feed.length - 1} />
        ))}
      </div>

      {/* Weather — c2 */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm sm:col-span-2"
        style={{ background: 'linear-gradient(135deg, #518E6D, #0D783C)' }}
      >
        <div
          className="absolute -right-5 -top-[30px] h-[130px] w-[130px] rounded-full"
          style={{ background: 'rgba(241,212,18,0.25)', filter: 'blur(22px)' }}
        />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[13px] opacity-90">
                <MapPin size={14} /> Hassan, Karnataka
              </div>
              <div className="mt-1.5 font-display text-[40px] font-bold tracking-tight">27°</div>
              <div className="text-[13.5px] opacity-90">
                Partly cloudy · spraying window till 4 PM
              </div>
            </div>
            <Cloud size={40} strokeWidth={1.6} color="#fff" />
          </div>
          <div className="mt-[18px] flex gap-2">
            {(
              [
                ['Mon', 28],
                ['Tue', 26],
                ['Wed', 24],
                ['Thu', 27],
                ['Fri', 29],
              ] as Array<[string, number]>
            ).map(([d, t]) => (
              <div
                key={d}
                className="flex-1 rounded-[10px] px-1 py-[9px] text-center"
                style={{ background: 'rgba(255,255,255,0.16)' }}
              >
                <div className="text-[11px] opacity-85">{d}</div>
                <div className="mt-[3px] font-mono text-sm font-semibold">{t}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedRow({ item, last }: { item: FeedItem; last: boolean }) {
  const { icon, color, title, subtitle, time } = item;
  const Icon = FEED_ICONS[icon];
  return (
    <div
      className={`flex items-center gap-3 py-[11px] ${last ? '' : 'border-b border-border'}`}
    >
      <span
        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px]"
        style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
      >
        {Icon && <Icon size={16} strokeWidth={2} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold text-fg">{title}</div>
        <div className="text-xs text-fg-muted">{subtitle}</div>
      </div>
      <span className="shrink-0 font-mono text-[11.5px] text-fg-subtle">{time}</span>
    </div>
  );
}

export const FEED_ICONS = {
  Users,
  Activity: ActivityIcon,
  MapPin,
  Box,
} satisfies Record<string, LucideIcon>;

export const FEED_COLORS = { PRIMARY, INFO, SECONDARY_D, GRN };
