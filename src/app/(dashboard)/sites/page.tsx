import Link from 'next/link';
import { Plus, Globe, ExternalLink, Pencil } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, type Column } from '@/components/tables/data-table';
import { FilterBar } from '@/components/tables/filter-bar';
import { formatDate, formatNumber } from '@/lib/utils';
import type { Site, SiteStatus } from '@/types/database';

export const metadata = { title: 'Nettsider' };

const STATUS_VARIANTS: Record<SiteStatus, 'success' | 'neutral' | 'warning'> = {
  active: 'success',
  draft: 'neutral',
  paused: 'warning',
  archived: 'neutral',
};
const STATUS_LABELS: Record<SiteStatus, string> = {
  active: 'Aktiv',
  draft: 'Utkast',
  paused: 'Pauset',
  archived: 'Arkivert',
};

interface SiteRow extends Site {
  article_count: number;
  domain_count: number;
}

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { profile } = await requirePermission('sites:view');
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('sites')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (sp.q) {
    query = query.or(`name.ilike.%${sp.q}%,domain.ilike.%${sp.q}%,slug.ilike.%${sp.q}%`);
  }
  if (sp.status && sp.status !== 'all') {
    query = query.eq('status', sp.status as SiteStatus);
  }

  const { data: sitesData, count } = await query;
  const sites = (sitesData ?? []) as Site[];

  // Hent counts for hver site (parallelt). For 100+ sites burde dette
  // bli en SQL view i fase 6, men for nå er det greit.
  const enriched = await Promise.all(
    sites.map(async (s) => {
      const [a, d] = await Promise.all([
        supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', s.id),
        supabase
          .from('domains')
          .select('id', { count: 'exact', head: true })
          .eq('project_site_id', s.id),
      ]);
      return {
        ...s,
        article_count: a.count ?? 0,
        domain_count: d.count ?? 0,
      } as SiteRow;
    })
  );

  const canCreate = hasPermission(profile.role, 'sites:create');
  const canEdit = hasPermission(profile.role, 'sites:edit');

  const columns: Column<SiteRow>[] = [
    {
      key: 'name',
      header: 'Nettside',
      cell: (s) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-bg-panel-light border border-border flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-fg-muted" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-fg truncate">{s.name}</p>
            <p className="text-xs text-fg-subtle truncate">{s.domain}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (s) => (
        <StatusBadge variant={STATUS_VARIANTS[s.status]} dot>
          {STATUS_LABELS[s.status]}
        </StatusBadge>
      ),
    },
    {
      key: 'articles',
      header: 'Artikler',
      align: 'right',
      cell: (s) => (
        <span className="tabular-nums text-fg-muted">
          {formatNumber(s.article_count)}
        </span>
      ),
    },
    {
      key: 'domains',
      header: 'Domener',
      align: 'right',
      cell: (s) => (
        <span className="tabular-nums text-fg-muted">
          {formatNumber(s.domain_count)}
        </span>
      ),
    },
    {
      key: 'lang',
      header: 'Språk',
      cell: (s) => (
        <span className="text-xs text-fg-subtle uppercase">
          {s.language ?? '—'}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Opprettet',
      cell: (s) => <span className="text-xs text-fg-subtle">{formatDate(s.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          <a
            href={`https://${s.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md text-fg-subtle hover:bg-bg-panel-light hover:text-fg transition-colors"
            aria-label={`Åpne ${s.domain}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {canEdit && (
            <Link
              href={`/sites/${s.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-fg-subtle hover:bg-bg-panel-light hover:text-fg transition-colors"
              aria-label={`Rediger ${s.name}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Nettsider"
        description={`${formatNumber(count ?? 0)} nettside${count === 1 ? '' : 'r'} i porteføljen`}
        action={
          canCreate ? (
            <Link href="/sites/new">
              <Button>
                <Plus className="w-4 h-4" />
                Ny nettside
              </Button>
            </Link>
          ) : undefined
        }
      />

      <FilterBar
        searchPlaceholder="Søk på navn eller domene…"
        filters={[
          {
            name: 'status',
            label: 'statuser',
            options: [
              { value: 'active', label: 'Aktive' },
              { value: 'draft', label: 'Utkast' },
              { value: 'paused', label: 'Pauset' },
              { value: 'archived', label: 'Arkiverte' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={enriched}
        rowKey={(s) => s.id}
        rowHref={canEdit ? (s) => `/sites/${s.id}/edit` : undefined}
        emptyState={
          <div className="panel">
            <EmptyState
              icon={Globe}
              title={sp.q || sp.status ? 'Ingen treff' : 'Ingen nettsider enda'}
              description={
                sp.q || sp.status
                  ? 'Prøv å justere filtrene.'
                  : 'Legg til den første nettsiden for å komme i gang.'
              }
              action={
                canCreate && !(sp.q || sp.status) ? (
                  <Link href="/sites/new">
                    <Button>
                      <Plus className="w-4 h-4" />
                      Legg til nettside
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          </div>
        }
      />
    </>
  );
}
