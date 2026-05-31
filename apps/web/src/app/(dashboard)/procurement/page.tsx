import { Banknote, CheckCircle2, Clock, Plus, Wallet } from 'lucide-react';
import { api, readAccessToken } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { MiniStat } from '@/components/dashboard/MiniStat';
import { ProcurementTable, toProcurementRow } from './ProcurementTable';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default async function ProcurementPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;

  const [result, stats] = await Promise.all([
    api.listProcurement(token, { status, page: page ? Number(page) : 1, pageSize: 50 }),
    api
      .getProcurementStats(token)
      .catch(() => ({ total: 0, pending: 0, completed: 0, totalValue: 0 })),
  ]);

  const rows = result.data.map(toProcurementRow);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Procurement"
        sub="Payments to farmers & FPOs across the cluster"
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
          >
            <Plus size={16} /> Record procurement
          </button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          label="Total value"
          value={inr(stats.totalValue)}
          tone="primary"
          mono
          icon={<Banknote size={18} />}
        />
        <MiniStat label="Orders" value={stats.total} tone="muted" icon={<Wallet size={18} />} />
        <MiniStat label="Pending" value={stats.pending} tone="warning" icon={<Clock size={18} />} />
        <MiniStat
          label="Completed"
          value={stats.completed}
          tone="success"
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      <ProcurementTable
        rows={rows}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        status={status}
      />
    </section>
  );
}
