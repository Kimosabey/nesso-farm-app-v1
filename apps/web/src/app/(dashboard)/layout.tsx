import { redirect } from 'next/navigation';
import { api, ApiError, readAccessToken } from '@/lib/api';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

function formatRole(role: string): string {
  if (!role) return 'NESSO';
  const pretty = role
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return `${pretty} · NESSO`;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await readAccessToken();
  if (!token) redirect('/login');

  try {
    const [me, stats] = await Promise.all([
      api.me(token),
      api
        .getFarmerStats(token)
        .catch(() => ({ pending: 0, approved: 0, rejected: 0, total: 0 })),
    ]);

    const userName =
      [me.firstName, me.lastName].filter(Boolean).join(' ').trim() || me.phone;

    return (
      <DashboardShell
        pendingApprovals={stats.pending}
        userName={userName}
        userRole={formatRole(me.role)}
      >
        {children}
      </DashboardShell>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login');
    throw err;
  }
}
