import Link from 'next/link';
import { Plus, Network, Upload, ArrowUpDown } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, type Column } from '@/components/tables/data-table';
import { FilterBar } from '@/components/tables/filter-bar';
import { Pagination } from '@/components/tables/pagination';
import { formatDate, formatNumber, cn } from '@/lib/utils';
import type { Domain, DomainStatus } from '@/types/database';

export const metadata = { title: 'Domener' };

const PAGE_SIZE = 50;

const STATUS_LABELS: Record<DomainStatus, string> = {
  owned: 'Eid',
  not_started: 'Ikke startet',
  planned: 'Planlagt',
  in_build: 'Bygges',
  live: 'Live',
  ranking: 'Ranker',
  lead_machine: 'Leadmaskin',
  for_lease: 'Til leasing',
  reserved: 'Reservert',
  sold: 'Solgt',
  paused: 'Pauset',
  expired_watch: 'Utløper',
};

const STATUS_VARIANTS: Record<DomainStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand' | 'accent'> = {
  owned: 'neutral',
  not_started: 'neutral',
  planned: 'info',
  in_build: 'info',
  live: 'success',
  ranking: 'success',
  lead_machine: 'accent',
  for_lease: 'warning',
  reserved: 'warning',
  sold: 'neutral',
  paused: 'neutral',
  expired_watch: 'danger',
};

type SortKey = 'priority' | 'renewal' | 'created' | 'name';

interface DomainRow extends Domain {
  project_site?: { name: string; slug: string } | null;
}

export default async function DomainsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    tld?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { profile } = await requirePermission('domains:view');
  const sp = await searchParams;
  const supabase = await createClient();

  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const sort: SortKey = (['priority', 'renewal', 'created', 'name'] as const).includes(
    sp.sort as SortKey
  )
    ? (sp.sort as SortKey)
    : 'priority';

  let query = supabase
    .from('domains')
    .select('*, project_site:sites!project_site_id(name, slug)', { count: 'exact' });

  if (sp.q) {
    query = query.ilike('domain_name', `%${sp.q}%`);
  }
  if (sp.status && sp.status !== 'all') {
    query = query.eq('status', sp.status as DomainStatus);
  }
  if (sp.tld && sp.tld !== 'all') {
    query = query.eq('tld', sp.tld);
  }

  switch (sort) {
    case 'priority':
      query = query.order('priority_score', { ascending: false, nullsFirst: false });
      break;
    case 'renewal':
      query = query.order('renewal_date', { ascending: true, nullsFirst: false });
      break;
    case 'created':
      query = query.order('created_at', { ascending: false });
      break;
    case 'name':
      query = query.order('domain_name', { ascending: true });
      break;
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  const domains = (data ?? []) as unknown as DomainRow[];

  // TLD-filter options - hent distinkte TLD-er
  const { data: tldData } = await supabase
    .from('domains')
    .select('tld')
    .not('tld', 'is', null);
  const tldOptions = Array.from(
    new Set((tldData ?? []).map((r) => r.tld).filter(Boolean) as string[])
  )
    .sort()
    .slice(0, 30)
    .map((t) => ({ value: t, label: `.${t}` }));

  const canCreate = hasPermission(profile.role, 'domains:create');
  const canEdit = hasPermission(profile.role, 'domains:edit');

  const columns: Column<DomainRow>[] = [
    {
      key: 'domain',
      header: 'Domene',
      cell: (d) => (
        <div className="min-w-0">
          <p className="font-medium text-fg truncate">{d.domain_name}</p>
          {d.category && (
            <p className="text-xs text-fg-subtle truncate">{d.category}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (d) => (
        <StatusBadge variant={STATUS_VARIANTS[d.status]} dot>
          {STATUS_LABELS[d.status]}
        </StatusBadge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      align: 'right',
      cell: (d) => <PriorityCell value={d.priority_score} />,
    },
    {
      key: 'lead',
      header: 'Lead',
      align: 'right',
      cell: (d) => <ScorePill value={d.lead_potential_score} />,
    },
    {
      key: 'traffic',
      header: 'Traffic',
      align: 'right',
      cell: (d) => <ScorePill value={d.traffic_potential_score} />,
    },
    {
      key: 'commercial',
      header: 'Komm.',
      align: 'right',
      cell: (d) => <ScorePill value={d.commercial_intent_score} />,
    },
    {
      key: 'project',
      header: 'Prosjekt',
      cell: (d) =>
        d.project_site ? (
          <span className="text-xs text-fg-muted">{d.project_site.name}</span>
        ) : (
          <span className="text-xs text-fg-subtle">—</span>
        ),
    },
    {
      key: 'renewal',
      header: 'Fornyes',
      cell: (d) => <RenewalCell date={d.renewal_date} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Domener"
        description={`${formatNumber(count ?? 0)} domene${count === 1 ? '' : 'r'} i porteføljen`}
        action={
          canCreate ? (
            <div className="flex gap-2">
              <Link href="/domains/import">
                <Button variant="secondary">
                  <Upload className="w-4 h-4" />
                  Bulk import
                </Button>
              </Link>
              <Link href="/domains/new">
                <Button>
                  <Plus className="w-4 h-4" />
                  Nytt domene
                </Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      <FilterBar
        searchPlaceholder="Søk etter domene…"
        filters={[
          {
            name: 'status',
            label: 'statuser',
            options: Object.entries(STATUS_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          },
          {
            name: 'tld',
            label: 'TLD-er',
            options: tldOptions,
          },
          {
            name: 'sort',
            label: 'sortering',
            options: [
              { value: 'priority', label: 'Priority score' },
              { value: 'renewal', label: 'Fornyelsesdato' },
              { value: 'created', label: 'Sist lagt til' },
              { value: 'name', label: 'Alfabetisk' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        rows={domains}
        rowKey={(d) => d.id}
        rowHref={canEdit ? (d) => `/domains/${d.id}/edit` : undefined}
        emptyState={
          <div className="panel">
            <EmptyState
              icon={Network}
              title={sp.q || sp.status || sp.tld ? 'Ingen treff' : 'Ingen domener registrert'}
              description={
                sp.q || sp.status || sp.tld
                  ? 'Prøv å justere filtrene.'
                  : 'Registrer det første domenet eller bruk bulk-import for porteføljen.'
              }
              action={
                canCreate && !(sp.q || sp.status || sp.tld) ? (
                  <div className="flex gap-2">
                    <Link href="/domains/import">
                      <Button variant="secondary">
                        <Upload className="w-4 h-4" />
                        Bulk import
                      </Button>
                    </Link>
                    <Link href="/domains/new">
                      <Button>
                        <Plus className="w-4 h-4" />
                        Legg til domene
                      </Button>
                    </Link>
                  </div>
                ) : undefined
              }
            />
          </div>
        }
      />

      {(count ?? 0) > PAGE_SIZE && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      )}
    </>
  );
}

// -----------------------------------------------------------------------------
// Cells
// -----------------------------------------------------------------------------

function PriorityCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-fg-subtle">—</span>;
  const tone =
    value >= 80
      ? 'text-success'
      : value >= 60
      ? 'text-accent'
      : value >= 40
      ? 'text-warning'
      : 'text-fg-subtle';
  return (
    <span className={cn('font-mono text-sm font-semibold tabular-nums', tone)}>
      {value}
    </span>
  );
}

function ScorePill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-fg-subtle">—</span>;
  return (
    <span className="font-mono text-xs tabular-nums text-fg-muted">{value}</span>
  );
}

function RenewalCell({ date }: { date: string | null }) {
  if (!date) return <span className="text-xs text-fg-subtle">—</span>;
  const days = Math.floor(
    (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  let tone = 'text-fg-muted';
  let label = formatDate(date);
  if (days < 0) {
    tone = 'text-danger';
    label = `Utløpt`;
  } else if (days < 30) {
    tone = 'text-danger';
    label = `${days} d`;
  } else if (days < 90) {
    tone = 'text-warning';
    label = `${days} d`;
  }
  return <span className={cn('text-xs', tone)}>{label}</span>;
}
