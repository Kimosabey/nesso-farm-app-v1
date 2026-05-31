import Link from 'next/link';
import { Plus } from 'lucide-react';
import { api, readAccessToken } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { FarmsTable, toFarmRow } from './FarmsTable';

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function FarmsPage({ searchParams }: PageProps) {
  const { page, q } = await searchParams;
  const token = (await readAccessToken())!;

  const [farms, farmers] = await Promise.all([
    api.listFarms(token, { page: page ? Number(page) : 1, pageSize: 25 }),
    api.listFarmers(token, { pageSize: 200 }),
  ]);

  const farmerById = new Map(farmers.data.map((f) => [f._id, f]));
  const rows = farms.data.map((f) => toFarmRow(f, farmerById));

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Farms"
        sub={`${farms.total.toLocaleString()} ${
          farms.total === 1 ? 'farm' : 'farms'
        } mapped in the Hassan cluster`}
        actions={
          <Link
            href="/farms/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
          >
            <Plus size={16} /> Add farm
          </Link>
        }
      />

      <FarmsTable
        rows={rows}
        total={farms.total}
        page={farms.page}
        totalPages={farms.totalPages}
        query={q ?? ''}
      />
    </section>
  );
}
