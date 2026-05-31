import { CheckCircle2, Clock, Layers, Plus, XCircle } from 'lucide-react';
import { api, readAccessToken } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { MiniStat } from '@/components/dashboard/MiniStat';
import { AuditsTable, toAuditRow } from './AuditsTable';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AuditsPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;

  const [result, stats] = await Promise.all([
    api.listAudits(token, { status, page: page ? Number(page) : 1, pageSize: 50 }),
    api
      .getAuditStats(token)
      .catch(() => ({ Pending: 0, Approved: 0, Rejected: 0, total: 0 }) as Record<string, number>),
  ]);

  const rows = result.data.map(toAuditRow);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Audits"
        sub="Compliance & field audits across the cluster"
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
          >
            <Plus size={16} /> New audit
          </button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Total" value={stats.total ?? 0} tone="muted" icon={<Layers size={18} />} />
        <MiniStat label="Pending" value={stats.Pending ?? 0} tone="warning" icon={<Clock size={18} />} />
        <MiniStat
          label="Approved"
          value={stats.Approved ?? 0}
          tone="success"
          icon={<CheckCircle2 size={18} />}
        />
        <MiniStat
          label="Rejected"
          value={stats.Rejected ?? 0}
          tone="danger"
          icon={<XCircle size={18} />}
        />
      </div>

      <AuditsTable
        rows={rows}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        status={status}
      />
    </section>
  );
}
