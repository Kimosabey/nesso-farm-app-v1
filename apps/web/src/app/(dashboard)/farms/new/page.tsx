import Link from 'next/link';
import { api, readAccessToken } from '@/lib/api';
import { FarmForm } from './FarmForm';

export default async function NewFarmPage() {
  const token = (await readAccessToken())!;
  const farmers = await api.listFarmers(token, {
    pageSize: 200,
    approvalStatus: 'approved',
  });

  return (
    <section className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-2 text-sm text-fg-muted">
        <Link href="/farms" className="hover:text-primary">
          ← Farms
        </Link>
      </div>
      <h1 className="font-display text-3xl tracking-tight text-fg">Register a farm</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Click the map to drop a pin, <kbd className="rounded border border-border-strong px-1 text-xs">Shift</kbd>+click
        to add polygon vertices. Area auto-calculates.
      </p>

      <div className="mt-6">
        {farmers.data.length === 0 ? (
          <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5 text-sm">
            <p className="font-medium text-warning">No approved farmers yet.</p>
            <p className="mt-1 text-fg-muted">
              Register and approve a farmer first — only approved farmers can have farms.
            </p>
            <Link
              href="/farmers"
              className="mt-3 inline-flex h-9 items-center rounded-md border border-border-strong px-3 text-sm text-fg hover:bg-bg-muted"
            >
              Go to farmers
            </Link>
          </div>
        ) : (
          <FarmForm farmers={farmers.data} />
        )}
      </div>
    </section>
  );
}
