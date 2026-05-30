import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';
import { StatusBadge, toneForSampleStatus } from '@/components/dashboard/Badges';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function SamplesPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;
  const [result, stats] = await Promise.all([
    api.listSamples(token, {
      status,
      page: page ? Number(page) : 1,
      pageSize: 50,
    }),
    api.getSampleStats(token),
  ]);

  const tiles = [
    { label: 'Queue', value: stats.Queue ?? 0, key: 'Queue' },
    { label: 'Sent', value: stats.Sent ?? 0, key: 'Sent' },
    { label: 'Received', value: stats.Received ?? 0, key: 'Received' },
    { label: 'Tested', value: stats.Tested ?? 0, key: 'Tested' },
    { label: 'Approved', value: stats.Approved ?? 0, key: 'Approved' },
    { label: 'Rejected', value: stats.Rejected ?? 0, key: 'Rejected' },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Samples</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? 'sample' : 'samples'} recorded
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {tiles.map((t) => (
          <Link
            key={t.key}
            href={`/samples?status=${t.key}`}
            className={`rounded-xl border bg-bg-elevated p-3 transition hover:border-primary/50 ${
              status === t.key ? 'border-primary' : 'border-border'
            }`}
          >
            <dt className="text-[10px] uppercase tracking-wider text-fg-subtle">{t.label}</dt>
            <dd className="mt-0.5 font-display text-2xl tabular-nums text-fg">{t.value}</dd>
          </Link>
        ))}
      </dl>

      {status ? (
        <div className="mt-4">
          <Link
            href="/samples"
            className="inline-flex h-8 items-center rounded-md border border-border-strong px-3 text-xs text-fg hover:bg-bg-muted"
          >
            Clear filter ({status})
          </Link>
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {result.data.length === 0 ? (
          <div className="px-5 py-12 text-center text-fg-muted">
            {status ? `No ${status} samples.` : 'No samples yet.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-left text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Crop</th>
                <th className="hidden px-4 py-3 md:table-cell">Variety</th>
                <th className="hidden px-4 py-3 lg:table-cell">Farmer</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.data.map((s) => (
                <tr key={s._id} className="transition hover:bg-bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs text-fg-subtle">{s.sampleCode}</td>
                  <td className="px-4 py-3 font-medium text-fg">{s.crop}</td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">{s.variety}</td>
                  <td className="hidden px-4 py-3 text-fg-muted lg:table-cell">
                    {s.farmerName ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={s.status} tone={toneForSampleStatus(s.status)} />
                  </td>
                  <td className="hidden px-4 py-3 text-fg-subtle md:table-cell">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
