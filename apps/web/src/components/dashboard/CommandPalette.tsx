'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { NAV_ITEMS, SETTINGS_ITEM, type NavItem } from './nav-items';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JUMP_ITEMS: NavItem[] = [...NAV_ITEMS, SETTINGS_ITEM];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/45 pt-[12vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <Command
        label="Command palette"
        loop
        onClick={(e) => e.stopPropagation()}
        className="w-[min(560px,92vw)] origin-top overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-lg [animation:cmdIn_.2s_cubic-bezier(0.32,0.72,0,1)]"
      >
        <div className="flex items-center gap-3 border-b border-border px-[18px] py-4">
          <Search className="size-5 shrink-0 text-fg-subtle" aria-hidden />
          <Command.Input
            autoFocus
            placeholder="Search pages, farmers, batches…"
            className="flex-1 border-none bg-transparent text-base text-fg outline-none placeholder:text-fg-subtle"
          />
          <kbd className="rounded-[5px] bg-bg-muted px-[7px] py-[3px] font-mono text-[11px] text-fg-subtle">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[340px] overflow-y-auto p-2">
          <Command.Empty className="px-6 py-6 text-center text-sm text-fg-subtle">
            No results.
          </Command.Empty>
          <Command.Group
            heading="Jump to"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em] [&_[cmdk-group-heading]]:text-fg-subtle"
          >
            {JUMP_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Command.Item
                  key={item.id}
                  value={`${item.label} ${item.id}`}
                  onSelect={() => go(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-[10px] text-sm text-fg data-[selected=true]:bg-bg-muted"
                >
                  <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.kbd && (
                    <kbd className="rounded-[5px] bg-bg-muted px-[7px] py-px font-mono text-[11px] text-fg-subtle">
                      {item.kbd}
                    </kbd>
                  )}
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
