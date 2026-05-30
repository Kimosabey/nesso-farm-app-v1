import type { ReactNode } from 'react';
import { Activity, CheckCircle2, Clock, X } from 'lucide-react';
import { api, readAccessToken, type Farmer } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ApprovalsSplit, type QueueItem } from './ApprovalsSplit';

export default async function ApprovalsPage() {
  const token = (await readAccessToken())!;
  const [stats, pendingResult] = await Promise.all([
    api.getFarmerStats(token).catch(() => ({ pending: 0, approved: 0, rejected: 0, total: 0 })),
    api.listFarmers(token, { approvalStatus: 'pending', page: 1, pageSize: 100 }),
  ]);

  const items: QueueItem[] = pendingResult.data.map(toQueueItem);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader title="Approvals" sub={`${stats.pending} items awaiting your review`} />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat
          label="Pending"
          value={stats.pending}
          icon={<Clock size={20} />}
          tint="bg-warning/15 text-warning"
        />
        <MiniStat
          label="Approved"
          value={stats.approved}
          icon={<CheckCircle2 size={20} />}
          tint="bg-primary/10 text-primary"
        />
        <MiniStat
          label="Rejected"
          value={stats.rejected}
          icon={<X size={20} />}
          tint="bg-danger/10 text-danger"
        />
        <MiniStat
          label="Total"
          value={stats.total}
          icon={<Activity size={20} />}
          tint="bg-info/10 text-info"
        />
      </div>

      <ApprovalsSplit items={items} />
    </section>
  );
}

function MiniStat({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elevated p-[18px] shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}>
          {icon}
        </span>
        <div>
          <div className="font-display text-[26px] font-bold tracking-tight text-fg">
            {value.toLocaleString()}
          </div>
          <div className="text-[12.5px] text-fg-muted">{label}</div>
        </div>
      </div>
    </div>
  );
}

function toQueueItem(f: Farmer): QueueItem {
  const who = [f.firstName, f.lastName].filter(Boolean).join(' ').trim() || f.farmerId;
  return {
    id: f._id,
    who,
    village: f.address?.village ?? f.address?.district ?? 'Hassan',
    crop: f.selectedCrops?.[0] ?? '—',
    age: timeAgo(f.createdAt),
    risk: f.isFlowerAgent ? 'med' : 'low',
    mobile: f.mobileNumber,
    association: f.isFlowerAgent ? 'Flower agent' : f.groupAssociation.replace('_', ' '),
  };
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
