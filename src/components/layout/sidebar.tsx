'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import type { UserRole } from '@/types/database';
import { NAV_ITEMS } from './nav-items';

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => hasPermission(role, item.permission));

  // Gruppér
  const groups = visibleItems.reduce<Record<string, typeof NAV_ITEMS>>((acc, item) => {
    const g = item.group ?? 'Annet';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <aside className="hidden lg:flex w-60 flex-col bg-bg-panel border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
            <span className="text-brand font-bold text-sm">IT</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-fg">IT Firma</span>
            <span className="text-[10px] uppercase tracking-wider text-fg-subtle">Growth OS</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group} className="mb-6 last:mb-0">
            <h3 className="px-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-fg-subtle">
              {group}
            </h3>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-brand-subtle text-brand'
                          : 'text-fg-muted hover:text-fg hover:bg-bg-panel-light'
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="px-2 py-2 text-[10px] text-fg-subtle">
          v0.1 · Fase 1
        </div>
      </div>
    </aside>
  );
}
