import { redirect } from 'next/navigation';
import { api, ApiError, readAccessToken } from '@/lib/api';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await readAccessToken();
  if (!token) redirect('/login');

  try {
    const [me, stats] = await Promise.all([
      api.me(token),
      api.getFarmerStats(token).catch(() => ({ pending: 0, approved: 0, rejected: 0, total: 0 })),
    ]);

    return (
      <div className="flex min-h-dvh bg-bg">
        <Sidebar pendingApprovals={stats.pending} />
        <div className="flex min-h-dvh flex-1 flex-col">
          <Topbar me={me} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  }
}
