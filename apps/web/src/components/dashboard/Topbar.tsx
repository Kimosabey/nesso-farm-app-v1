import { logoutAction } from '@/app/(auth)/login/actions';
import type { MeResponse } from '@/lib/api';

interface TopbarProps {
  me: MeResponse;
}

export function Topbar({ me }: TopbarProps) {
  const initials = (me.firstName?.[0] ?? me.phone[0] ?? '?').toUpperCase();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg-elevated/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3 text-sm text-fg-muted">
        <span className="rounded-full bg-bg-muted px-2 py-0.5 text-xs">{me.role}</span>
        <span className="hidden sm:inline">·</span>
        <code className="hidden font-mono text-xs text-fg-subtle sm:inline">{me.phone}</code>
      </div>
      <div className="flex items-center gap-3">
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
