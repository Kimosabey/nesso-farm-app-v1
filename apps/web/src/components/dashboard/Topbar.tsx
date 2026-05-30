'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-react';

interface TopbarProps {
  onOpenCmd: () => void;
  crumbs?: string[];
  userName?: string;
  userRole?: string;
}

function deriveCrumbs(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return ['Dashboard'];
  return parts.map((p) =>
    p
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
  );
}

function initials(name: string): string {
  return (
    name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

export function Topbar({
  onOpenCmd,
  crumbs,
  userName = 'Ravi Teja',
  userRole = 'Admin · NESSO',
}: TopbarProps) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Click-outside to close account menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const items = crumbs ?? deriveCrumbs(pathname);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-[14px] border-b border-border bg-bg-elevated/[0.72] px-[22px] backdrop-blur-md backdrop-saturate-150">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 text-sm text-fg-muted"
      >
        {items.map((c, i) => (
          <span key={`${c}-${i}`} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="size-[15px] text-fg-subtle" aria-hidden />}
            <span
              className={
                i === items.length - 1
                  ? 'whitespace-nowrap font-semibold text-fg'
                  : 'whitespace-nowrap font-medium text-fg-muted'
              }
            >
              {c}
            </span>
          </span>
        ))}
      </nav>

      {/* ⌘K search trigger */}
      <button
        type="button"
        onClick={onOpenCmd}
        className="ml-auto flex h-[38px] min-w-[200px] items-center gap-[10px] rounded-[10px] border border-border bg-bg-muted px-3 text-[13px] text-fg-subtle transition hover:border-border-strong"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="rounded-[5px] border border-border bg-bg-elevated px-[6px] py-[2px] font-mono text-[11px] text-fg-muted">
          ⌘K
        </kbd>
      </button>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label="Toggle theme"
        className="grid size-[38px] place-items-center rounded-[10px] border border-border bg-bg-muted text-fg transition hover:border-border-strong"
      >
        {isDark ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden />}
      </button>

      {/* Notifications */}
      <Link
        href="/notifications"
        aria-label="Notifications"
        className="relative grid size-[38px] place-items-center rounded-[10px] border border-border bg-bg-muted text-fg transition hover:border-border-strong"
      >
        <Bell className="size-[18px]" aria-hidden />
        <span className="absolute right-2 top-[7px] size-[7px] rounded-full bg-danger ring-2 ring-bg-muted" />
      </Link>

      {/* Account dropdown */}
      <div ref={menuRef} className="relative pl-[6px]">
        <button
          type="button"
          onClick={() => setMenuOpen((m) => !m)}
          aria-label="Account menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-[9px] rounded-[10px] py-[3px] pl-[3px] pr-[6px]"
        >
          <span className="grid size-[34px] place-items-center rounded-full bg-primary/15 font-display text-[13px] font-bold text-primary ring-[1.5px] ring-inset ring-primary/25">
            {initials(userName)}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-semibold text-fg">{userName}</span>
            <span className="block text-[11px] text-fg-subtle">{userRole}</span>
          </span>
          <ChevronDown className="ml-[2px] size-[15px] text-fg-subtle" aria-hidden />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[230px] rounded-[14px] border border-border bg-bg-elevated p-[7px] shadow-lg [animation:cmdIn_.18s_cubic-bezier(0.32,0.72,0,1)]">
            <div className="mb-[6px] flex items-center gap-[11px] border-b border-border px-[10px] pb-3 pt-2">
              <span className="grid size-[38px] place-items-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary ring-[1.5px] ring-inset ring-primary/25">
                {initials(userName)}
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-fg">{userName}</span>
                <span className="block truncate text-[11.5px] text-fg-subtle">{userRole}</span>
              </span>
            </div>
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-[11px] rounded-[9px] px-[10px] py-[9px] text-[13.5px] font-medium text-fg transition hover:bg-bg-muted"
            >
              <User className="size-[17px] text-fg-muted" aria-hidden />
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-[11px] rounded-[9px] px-[10px] py-[9px] text-[13.5px] font-medium text-fg transition hover:bg-bg-muted"
            >
              <Settings className="size-[17px] text-fg-muted" aria-hidden />
              Settings
            </Link>
            <Link
              href="/notifications"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-[11px] rounded-[9px] px-[10px] py-[9px] text-[13.5px] font-medium text-fg transition hover:bg-bg-muted"
            >
              <Bell className="size-[17px] text-fg-muted" aria-hidden />
              Notifications
            </Link>
            <div className="my-[6px] h-px bg-border" />
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-[11px] rounded-[9px] px-[10px] py-[9px] text-[13.5px] font-semibold text-danger transition hover:bg-danger/10"
            >
              <LogOut className="size-[17px]" aria-hidden />
              Log out
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
