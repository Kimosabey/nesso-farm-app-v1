'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';

const STORAGE_KEY = 'nesso.sidebarCollapsed';

interface DashboardShellProps {
  children: React.ReactNode;
  pendingApprovals?: number;
  userName?: string;
  userRole?: string;
}

export function DashboardShell({
  children,
  pendingApprovals = 0,
  userName,
  userRole,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Hydrate collapsed state from localStorage.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === 'true');
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        pendingApprovals={pendingApprovals}
      />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <Topbar
          onOpenCmd={() => setCmdOpen(true)}
          userName={userName}
          userRole={userRole}
        />
        <main className="flex-1">{children}</main>
      </div>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
