import { Activity, CheckCircle2, Clock, Plus, XCircle } from 'lucide-react';
import { api, readAccessToken } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { MiniStat } from '@/components/dashboard/MiniStat';
import { SamplesTable, toSampleRow } from './SamplesTable';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function SamplesPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;

  const [result, stats] = await Promise.all([
    api.listSamples(token, { status, page: page ? Number(page) : 1, pageSize: 50 }),
    api.getSampleStats(token).catch(() => ({}) as Record<string, number>),
  ]);

  const rows = result.data.map(toSampleRow);

  const queue = stats.Queue ?? 0;
  const sent = (stats.Sent ?? 0) + (stats.Received ?? 0);
  const tested = (stats.Tested ?? 0) + (stats.Approved ?? 0);
  const rejected = stats.Rejected ?? 0;

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Quality"
        sub="Lab samples & compliance testing across the cluster"
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> New sample
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="In queue" value={queue} tone="warning" icon={<Clock size={18} />} />
        <MiniStat label="Sent to lab" value={sent} tone="info" icon={<Activity size={18} />} />
        <MiniStat label="Tested / passed" value={tested} tone="primary" icon={<CheckCircle2 size={18} />} />
        <MiniStat label="Rejected" value={rejected} tone="danger" icon={<XCircle size={18} />} />
      </div>

      <SamplesTable
        rows={rows}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        query=""
        status={status}
      />
    </section>
  );
}
