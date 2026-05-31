import { Boxes, Package, PackageCheck, Truck } from 'lucide-react';
import { api, readAccessToken } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { MiniStat } from '@/components/dashboard/MiniStat';
import { InventoryTable, toInventoryRow } from './InventoryTable';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;

  const [result, stats] = await Promise.all([
    api.listInventory(token, { status, page: page ? Number(page) : 1, pageSize: 50 }),
    api
      .getInventoryStats(token)
      .catch(() => ({ total: 0, available: 0, processing: 0, sold: 0, transferred: 0 })),
  ]);

  const rows = result.data.map(toInventoryRow);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Inventory"
        sub="Batches, stock & stage movements across the cluster"
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
          >
            <PackageCheck size={16} /> Accept GRN
          </button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Total batches" value={stats.total} tone="muted" icon={<Boxes size={18} />} />
        <MiniStat
          label="Available"
          value={stats.available}
          tone="success"
          icon={<Package size={18} />}
        />
        <MiniStat
          label="Processing"
          value={stats.processing}
          tone="info"
          icon={<Boxes size={18} />}
        />
        <MiniStat
          label="Dispatched"
          value={stats.sold + stats.transferred}
          tone="primary"
          icon={<Truck size={18} />}
        />
      </div>

      <InventoryTable
        rows={rows}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        status={status}
      />
    </section>
  );
}
