import Link from 'next/link';
import { Download, Plus } from 'lucide-react';
import { api, readAccessToken } from '@/lib/api';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { FarmersTable, toFarmerRow } from './FarmersTable';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    association?: string;
  }>;
}

export default async function FarmersPage({ searchParams }: PageProps) {
  const { page, q, status, association } = await searchParams;
  const token = (await readAccessToken())!;

  const result = await api.listFarmers(token, {
    page: page ? Number(page) : 1,
    pageSize: 25,
    q,
    approvalStatus: status,
    association,
  });

  const rows = result.data.map(toFarmerRow);

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Farmers"
        sub={`${result.total.toLocaleString()} ${
          result.total === 1 ? 'farmer' : 'farmers'
        } in the Hassan cluster`}
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3.5 text-sm font-medium text-fg shadow-sm transition hover:bg-bg-muted"
            >
              <Download size={16} /> Export CSV
            </button>
            <Link
              href="/farmers/new"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-sm transition hover:bg-primary-700"
            >
              <Plus size={16} /> Register farmer
            </Link>
          </>
        }
      />

      <FarmersTable
        rows={rows}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        query={q ?? ''}
        status={status}
        association={association}
      />
    </section>
  );
}
