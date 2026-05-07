'use client';

import { useState, useRef, useEffect } from 'react';
import { LogOut, Search, ChevronDown } from 'lucide-react';
import { logoutAction } from '@/app/(auth)/login/actions';
import { getInitials } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/permissions';
import type { Profile } from '@/types/database';
import { RoleBadge } from '@/components/ui/role-badge';

export function Topbar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between gap-4 px-6 bg-bg-panel/60 backdrop-blur border-b border-border sticky top-0 z-40">
      {/* Søk */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none" />
          <input
            type="search"
            placeholder="Søk… (artikler, domener, leads)"
            className="w-full bg-bg-panel-light border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          />
          <kbd className="hidden md:inline absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-fg-subtle bg-bg-panel border border-border rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Bruker */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-bg-panel-light transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center text-xs font-semibold text-brand">
            {getInitials(profile.full_name, profile.email)}
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-medium text-fg">
              {profile.full_name ?? profile.email.split('@')[0]}
            </span>
            <span className="text-[10px] text-fg-subtle">{ROLE_LABELS[profile.role]}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-fg-subtle" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-64 panel p-2 animate-fade-in">
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-sm font-medium text-fg truncate">
                {profile.full_name ?? 'Ingen navn'}
              </p>
              <p className="text-xs text-fg-muted truncate">{profile.email}</p>
              <div className="mt-2">
                <RoleBadge role={profile.role} />
              </div>
            </div>

            <div className="py-1">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-fg-muted hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logg ut
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
