import Link from 'next/link';
import { Plus } from 'lucide-react';
import { api, readAccessToken, type Farm, type Farmer } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ActivitiesView, toActivityRow } from './ActivitiesView';

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const { status, page } = await searchParams;
  const token = (await readAccessToken())!;

  const [result, farmsRes, farmersRes] = await Promise.all([
    api.listActivities(token, { status, page: page ? Number(page) : 1, pageSize: 100 }),
    api.listFarms(token, { pageSize: 200 }).catch(() => ({ data: [] as Farm[] })),
    api.listFarmers(token, { pageSize: 200 }).catch(() => ({ data: [] as Farmer[] })),
  ]);

  const farmById = new Map(farmsRes.data.map((f) => [f._id, f]));
  const farmerById = new Map(farmersRes.data.map((f) => [f._id, f]));

  const rows = result.data.map((a) => {
    const farm = farmById.get(a.farmId);
    const farmer = farmerById.get(a.farmerId);
    const farmerName = farmer
      ? [farmer.firstName, farmer.lastName].filter(Boolean).join(' ').trim() || farmer.farmerId
      : '—';
    return toActivityRow(a, farm?.farmName ?? '—', farmerName);
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Activities"
        sub={`${result.total.toLocaleString()} field ${
          result.total === 1 ? 'operation' : 'operations'
        } across the cluster`}
        actions={
          <Link
            href="/activities/new"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> Log activity
          </Link>
        }
      />

      <ActivitiesView rows={rows} />
    </section>
  );
}
