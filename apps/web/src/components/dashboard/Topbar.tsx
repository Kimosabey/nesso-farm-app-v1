import Link from 'next/link';
import { Bell } from 'lucide-react';
import { logoutAction } from '@/app/(auth)/login/actions';
import type { MeResponse } from '@/lib/api';

interface TopbarProps {
  me: MeResponse;
  unreadNotifications?: number;
}

export function Topbar({ me, unreadNotifications = 0 }: TopbarProps) {
  const initials = (me.firstName?.[0] ?? me.phone[0] ?? '?').toUpperCase();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg-elevated/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3 text-sm text-fg-muted">
        <span className="rounded-full bg-bg-muted px-2 py-0.5 text-xs">{me.role}</span>
        <span className="hidden sm:inline">·</span>
        <code className="hidden font-mono text-xs text-fg-subtle sm:inline">{me.phone}</code>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          aria-label={
            unreadNotifications > 0
              ? `Notifications, ${unreadNotifications} unread`
              : 'Notifications'
          }
          className="relative inline-flex size-9 items-center justify-center rounded-full text-fg-muted transition hover:bg-bg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <Bell className="size-4" aria-hidden />
          {unreadNotifications > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          ) : null}
        </Link>
        <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-fg">
          {initials}
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="h-9 rounded-md border border-border-strong px-3 text-sm text-fg transition hover:bg-bg-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
