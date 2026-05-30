import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';

export default async function CropsPage() {
  const token = (await readAccessToken())!;
  const result = await api.listCrops(token, {});

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">Crops</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {result.total} {result.total === 1 ? 'crop cycle' : 'crop cycles'} recorded
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-bg-elevated">
        {result.data.length === 0 ? (
          <div className="px-5 py-12 text-center text-fg-muted">
            <p>No crops yet. Add a farm first, then crops can be associated.</p>
            <Link
              href="/farms/new"
              className="mt-4 inline-flex h-9 items-center rounded-md border border-border-strong px-3 text-sm text-fg hover:bg-bg-muted"
            >
              Register a farm
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-muted/50 text-left text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                <th className="px-4 py-3">Crop ID</th>
                <th className="px-4 py-3">Crop</th>
                <th className="hidden px-4 py-3 md:table-cell">Variety</th>
                <th className="px-4 py-3">Type</th>
                <th className="hidden px-4 py-3 lg:table-cell">Season</th>
                <th className="px-4 py-3 text-right">Area</th>
                <th className="hidden px-4 py-3 md:table-cell">Sown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.data.map((c) => (
                <tr key={c._id} className="transition hover:bg-bg-muted/40">
                  <td className="px-4 py-3 font-mono text-xs text-fg-subtle">{c.cropId}</td>
                  <td className="px-4 py-3 font-medium text-fg">{c.cropName}</td>
                  <td className="hidden px-4 py-3 text-fg-muted md:table-cell">
                    {c.cropVariety ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border-strong bg-bg-muted px-2 py-0.5 text-xs">
                      {c.cropType}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-fg-muted lg:table-cell">{c.season}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {c.acre} {c.unit}
                  </td>
                  <td className="hidden px-4 py-3 text-fg-subtle md:table-cell">
                    {c.sowingDate ? new Date(c.sowingDate).toLocaleDateString() : '—'}
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
