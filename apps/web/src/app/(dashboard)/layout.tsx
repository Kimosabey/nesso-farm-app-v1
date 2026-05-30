import { redirect } from 'next/navigation';
import { api, ApiError, readAccessToken } from '@/lib/api';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await readAccessToken();
  if (!token) redirect('/login');

  try {
    const [me, stats, inbox] = await Promise.all([
      api.me(token),
      api
        .getFarmerStats(token)
        .catch(() => ({ pending: 0, approved: 0, rejected: 0, total: 0 })),
      api
        .listNotifications(token, { pageSize: 1 })
        .catch(() => ({ data: [], page: 1, pageSize: 1, total: 0, totalPages: 0, unread: 0 })),
    ]);

    return (
      <div className="flex min-h-dvh bg-bg">
        <Sidebar pendingApprovals={stats.pending} />
        <div className="flex min-h-dvh flex-1 flex-col">
          <Topbar me={me} unreadNotifications={inbox.unread} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  }
}
