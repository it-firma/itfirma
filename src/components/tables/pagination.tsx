'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

export function Pagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const buildHref = (p: number) => {
    const np = new URLSearchParams(params.toString());
    if (p <= 1) np.delete('page');
    else np.set('page', String(p));
    const qs = np.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-xs text-fg-muted">
        Viser <span className="text-fg font-medium">{formatNumber(from)}</span>
        {' – '}
        <span className="text-fg font-medium">{formatNumber(to)}</span>{' av '}
        <span className="text-fg font-medium">{formatNumber(total)}</span>
      </p>

      <div className="flex items-center gap-1">
        <PageLink
          href={buildHref(page - 1)}
          disabled={page <= 1}
          aria-label="Forrige side"
        >
          <ChevronLeft className="w-4 h-4" />
        </PageLink>
        <span className="text-xs text-fg-muted px-2 tabular-nums">
          {page} / {totalPages}
        </span>
        <PageLink
          href={buildHref(page + 1)}
          disabled={page >= totalPages}
          aria-label="Neste side"
        >
          <ChevronRight className="w-4 h-4" />
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
  ...props
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  if (disabled) {
    return (
      <span
        {...props}
        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-fg-subtle cursor-not-allowed"
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      {...props}
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-md text-fg-muted',
        'hover:bg-bg-panel-light hover:text-fg transition-colors'
      )}
    >
      {children}
    </Link>
  );
}
