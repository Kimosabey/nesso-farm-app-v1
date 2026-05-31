import Link from 'next/link';
import { Download, Filter, Plus } from 'lucide-react';
import { api, readAccessToken, type Farmer } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import {
  DashboardBento,
  FEED_COLORS,
  type FeedItem,
} from '@/components/dashboard/DashboardBento';

export default async function DashboardPage() {
  const token = (await readAccessToken())!;
  const [stats, recent] = await Promise.all([
    api.getFarmerStats(token),
    api.listFarmers(token, { page: 1, pageSize: 4 }).catch(() => null),
  ]);

  const feed = buildFeed(recent?.data ?? []);

  return (
    <section className="mx-auto max-w-[1320px] px-6 py-8">
      <PageHeader
        title="Dashboard"
        sub="Hassan cluster · 2025–26 season"
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3.5 text-sm font-medium text-fg shadow-sm transition hover:bg-bg-muted"
            >
              <Filter size={16} /> 2025–26
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3.5 text-sm font-medium text-fg shadow-sm transition hover:bg-bg-muted"
            >
              <Download size={16} /> Export
            </button>
            <Link
              href="/farmers/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} /> Register farmer
            </Link>
          </>
        }
      />
      <DashboardBento
        farmersTotal={stats.total}
        pendingTotal={stats.pending}
        feed={feed}
      />
    </section>
  );
}

/** Real recent farmers → feed rows; falls back to the design spec rows. */
function buildFeed(farmers: Farmer[]): FeedItem[] {
  if (farmers.length > 0) {
    return farmers.slice(0, 4).map((f, i) => {
      const name = [f.firstName, f.lastName].filter(Boolean).join(' ').trim();
      const place = f.address?.village ?? f.address?.district ?? 'Hassan';
      const kyc =
        f.approvalStatus === 'approved'
          ? 'KYC verified'
          : f.approvalStatus === 'rejected'
            ? 'KYC failed'
            : 'KYC pending';
      return {
        icon: 'Users',
        color: FEED_COLORS.PRIMARY,
        title: `${name || f.farmerId} registered`,
        subtitle: `${place} · ${kyc}`,
        time: relativeTime(f.createdAt) || `${i + 1}d`,
      };
    });
  }

  return [
    {
      icon: 'Users',
      color: FEED_COLORS.PRIMARY,
      title: 'Lakshmi Gowda registered',
      subtitle: 'Channarayapatna · KYC pending',
      time: '12m',
    },
    {
      icon: 'Activity',
      color: FEED_COLORS.INFO,
      title: 'Spraying logged · ₹1,240',
      subtitle: 'Farm FRM-2839 · Mancozeb',
      time: '1h',
    },
    {
      icon: 'MapPin',
      color: FEED_COLORS.SECONDARY_D,
      title: '2.4 ha farm mapped',
      subtitle: 'Belur · 6 vertices',
      time: '3h',
    },
    {
      icon: 'Box',
      color: FEED_COLORS.GRN,
      title: 'GRN accepted · 320 kg',
      subtitle: 'BATCH-TBR-0291 · Belur FPO',
      time: '5h',
    },
  ];
}

function relativeTime(iso?: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}
