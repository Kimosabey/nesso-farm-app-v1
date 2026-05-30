'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeft } from 'lucide-react';
import { NAV_ITEMS, SETTINGS_ITEM, type NavItem } from './nav-items';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  pendingApprovals?: number;
}

export function Sidebar({ collapsed, onToggle, pendingApprovals = 0 }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const badge = item.badgeKind === 'approvals' ? pendingApprovals : 0;
    return (
      <Link
        key={item.id}
        href={item.href}
        title={item.label}
        aria-current={active ? 'page' : undefined}
        className={[
          'group relative flex h-11 items-center gap-3 rounded-[11px] text-sm transition',
          collapsed ? 'justify-center px-0' : 'px-3',
          active
            ? 'bg-primary/10 font-semibold text-primary'
            : 'font-medium text-fg-muted hover:bg-bg-muted hover:text-fg',
        ].join(' ')}
      >
        {active && (
          <span
            aria-hidden
            className="absolute left-0 top-[22%] bottom-[22%] w-[3px] rounded-full bg-primary"
          />
        )}
        <Icon className="size-5 shrink-0" strokeWidth={active ? 2 : 1.7} aria-hidden />
        {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
        {!collapsed && badge > 0 && (
          <span className="rounded-full bg-warning/15 px-[7px] py-px text-[11px] font-bold text-warning">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      style={{
        width: collapsed ? 74 : 248,
        transition: 'width .26s cubic-bezier(0.32,0.72,0,1)',
      }}
      className="hidden h-dvh shrink-0 flex-col border-r border-border bg-bg-elevated md:sticky md:top-0 md:flex"
    >
      {/* Logo header */}
      <div
        className={[
          'flex h-16 items-center gap-[11px] border-b border-border',
          collapsed ? 'justify-center px-0' : 'px-[18px]',
        ].join(' ')}
      >
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-white shadow-sm">
          <Image src="/nesso-logo.jpeg" alt="Nesso" width={24} height={24} className="size-6 rounded-sm" />
        </span>
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-[0.04em] text-fg">
            NESSO
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-[3px] overflow-y-auto p-3">
        {!collapsed && (
          <div className="px-3 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-fg-subtle">
            Workspace
          </div>
        )}
        {NAV_ITEMS.map(renderItem)}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-[3px] border-t border-border p-3">
        {renderItem(SETTINGS_ITEM)}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'flex h-11 items-center gap-3 rounded-[11px] text-[13px] font-medium text-fg-subtle transition hover:bg-bg-muted hover:text-fg',
            collapsed ? 'justify-center px-0' : 'px-3',
          ].join(' ')}
        >
          <PanelLeft className="size-5 shrink-0" strokeWidth={1.7} aria-hidden />
          {!collapsed && <span className="flex-1 text-left">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
