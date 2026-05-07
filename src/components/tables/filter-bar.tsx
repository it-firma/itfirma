'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

/**
 * URL-baserte filter-kontroller. Endrer searchParams, RSC re-fetcher.
 */
export function FilterBar({
  searchPlaceholder = 'Søk…',
  filters,
  className,
}: {
  searchPlaceholder?: string;
  filters?: Array<{
    name: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(params.toString());
    if (value === null || value === '' || value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Reset pagination ved filtrering
    newParams.delete('page');
    startTransition(() => {
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    });
  };

  const currentSearch = params.get('q') ?? '';
  const hasFilters =
    Array.from(params.keys()).filter((k) => k !== 'page').length > 0;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row gap-3 mb-5',
        isPending && 'opacity-70 pointer-events-none',
        className
      )}
    >
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none" />
        <input
          type="search"
          defaultValue={currentSearch}
          placeholder={searchPlaceholder}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            // Debounce via custom timeout
            window.clearTimeout((window as unknown as { __filterT?: number }).__filterT);
            (window as unknown as { __filterT?: number }).__filterT = window.setTimeout(() => {
              update('q', v || null);
            }, 250);
          }}
          className="w-full bg-bg-panel-light border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
        />
      </div>

      {filters?.map((f) => (
        <select
          key={f.name}
          value={params.get(f.name) ?? 'all'}
          onChange={(e) => update(f.name, e.target.value)}
          className="bg-bg-panel-light border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-brand focus:ring-1 focus:ring-brand transition-colors min-w-[140px]"
        >
          <option value="all">Alle {f.label.toLowerCase()}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {hasFilters && (
        <button
          onClick={() => {
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
          className="btn-ghost text-xs"
        >
          <X className="w-3.5 h-3.5" />
          Nullstill
        </button>
      )}
    </div>
  );
}
