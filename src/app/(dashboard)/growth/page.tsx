import Link from 'next/link';
import {
  TrendingUp,
  Target,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { recommendNextAction } from '@/lib/scores';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import type { Domain, Site } from '@/types/database';

export const metadata = { title: 'Growth' };

export default async function GrowthPage() {
  await requirePermission('growth:view');
  const supabase = await createClient();

  const [topPriorityRes, sitePerformanceRes, renewalsRes, statsRes] =
    await Promise.all([
      // Top 10 høyest prioriterte domener
      supabase
        .from('domains')
        .select('*')
        .not('priority_score', 'is', null)
        .order('priority_score', { ascending: false })
        .limit(10),

      // Sites med antall artikler/leads
      supabase.from('sites').select('*').neq('status', 'archived'),

      // Domener som må fornyes snart (< 90 dager)
      supabase
        .from('domains')
        .select('id, domain_name, renewal_date, status')
        .not('renewal_date', 'is', null)
        .lte(
          'renewal_date',
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        )
        .order('renewal_date', { ascending: true })
        .limit(10),

      // Aggregate stats
      Promise.all([
        supabase.from('domains').select('id', { count: 'exact', head: true }),
        supabase
          .from('domains')
          .select('id', { count: 'exact', head: true })
          .in('status', ['live', 'ranking', 'lead_machine']),
        supabase
          .from('domains')
          .select('id', { count: 'exact', head: true })
          .in('status', ['not_started', 'planned']),
        supabase
          .from('domains')
          .select('id', { count: 'exact', head: true })
          .gte('priority_score', 70),
      ]),
    ]);

  const topPriority = (topPriorityRes.data ?? []) as Domain[];
  const sites = (sitePerformanceRes.data ?? []) as Site[];
  const renewals = renewalsRes.data ?? [];
  const [totalDomains, liveDomains, plannedDomains, highPriorityCount] =
    statsRes.map((r) => r.count ?? 0);

  // Beregn artikler/leads per site
  const siteStats = await Promise.all(
    sites.map(async (s) => {
      const [articlesRes, leadsRes, domainsRes] = await Promise.all([
        supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', s.id)
          .eq('status', 'published'),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('site_id', s.id),
        supabase
          .from('domains')
          .select('id', { count: 'exact', head: true })
          .eq('project_site_id', s.id),
      ]);
      return {
        site: s,
        publishedArticles: articlesRes.count ?? 0,
        leads: leadsRes.count ?? 0,
        domainsAttached: domainsRes.count ?? 0,
      };
    })
  );

  // Sortér sites etter aktivitet
  siteStats.sort(
    (a, b) =>
      b.publishedArticles + b.leads * 2 - (a.publishedArticles + a.leads * 2)
  );

  return (
    <>
      <PageHeader
        title="Growth"
        description="Hvilke domener og nettsider bør du bygge ut først"
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile
          label="Totalt domener"
          value={totalDomains}
          icon={Target}
          tone="brand"
        />
        <StatTile
          label="Live / ranker"
          value={liveDomains}
          icon={TrendingUp}
          tone="success"
          hint={`${Math.round((liveDomains / Math.max(totalDomains, 1)) * 100)}% av porteføljen`}
        />
        <StatTile
          label="Ikke startet"
          value={plannedDomains}
          icon={Sparkles}
          tone="warning"
          hint="Mulighetsrom"
        />
        <StatTile
          label="Høy prioritet"
          value={highPriorityCount}
          icon={ArrowRight}
          tone="accent"
          hint="Score ≥ 70"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top priority domener */}
        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-fg">
                Topp prioritet — bygg disse først
              </h2>
              <p className="text-xs text-fg-subtle mt-0.5">
                Sortert etter priority score (lead × 0.30 + traffic × 0.25 + SEO × 0.20 + commercial × 0.20 + content gap)
              </p>
            </div>
            <Link
              href="/domains?sort=priority"
              className="text-xs text-brand hover:text-brand-hover"
            >
              Se alle →
            </Link>
          </div>

          {topPriority.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Ingen scoret ennå"
              description="Legg inn lead-, traffic-, SEO- og commercial-scores på domenene dine for å få prioriteringer."
            />
          ) : (
            <ul className="divide-y divide-border">
              {topPriority.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/domains/${d.id}/edit`}
                    className="flex items-center gap-4 py-3 hover:bg-bg-panel-light/40 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <PriorityRing value={d.priority_score ?? 0} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-fg truncate">
                        {d.domain_name}
                      </p>
                      <p className="text-xs text-fg-muted mt-0.5 truncate">
                        {recommendNextAction(d)}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-xs">
                      <ScoreCol label="Lead" value={d.lead_potential_score} />
                      <ScoreCol label="Traffic" value={d.traffic_potential_score} />
                      <ScoreCol label="Komm." value={d.commercial_intent_score} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fornyelser */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-fg">Fornyelser snart</h2>
            </div>
          </div>

          {renewals.length === 0 ? (
            <p className="text-sm text-fg-muted py-6 text-center">
              Ingen fornyelser de neste 90 dagene
            </p>
          ) : (
            <ul className="space-y-2">
              {renewals.map((r) => {
                const days = Math.floor(
                  (new Date(r.renewal_date!).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <li key={r.id}>
                    <Link
                      href={`/domains/${r.id}/edit`}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 -mx-2 rounded-md hover:bg-bg-panel-light/50 transition-colors"
                    >
                      <span className="text-sm text-fg truncate">
                        {r.domain_name}
                      </span>
                      <span
                        className={cn(
                          'text-xs tabular-nums flex-shrink-0',
                          days < 30 ? 'text-danger' : 'text-warning'
                        )}
                      >
                        {days < 0 ? 'Utløpt' : `${days} d`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Site performance */}
        <div className="lg:col-span-3 panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-fg">
              Aktivitet per nettside
            </h2>
            <Link href="/sites" className="text-xs text-brand hover:text-brand-hover">
              Se alle →
            </Link>
          </div>

          {siteStats.length === 0 ? (
            <p className="text-sm text-fg-muted py-6 text-center">
              Ingen nettsider enda
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {siteStats.map(({ site, publishedArticles, leads, domainsAttached }) => (
                <Link
                  key={site.id}
                  href={`/sites/${site.id}/edit`}
                  className="block p-4 bg-bg-panel-light rounded-lg border border-border hover:border-border-light transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium text-fg truncate">{site.name}</p>
                      <p className="text-xs text-fg-subtle truncate">{site.domain}</p>
                    </div>
                    <StatusBadge
                      variant={site.status === 'active' ? 'success' : 'neutral'}
                      dot
                    >
                      {site.status === 'active' ? 'Aktiv' : 'Utkast'}
                    </StatusBadge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="Publiserte" value={publishedArticles} />
                    <MiniStat label="Leads" value={leads} />
                    <MiniStat label="Domener" value={domainsAttached} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// -----------------------------------------------------------------------------

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'brand' | 'success' | 'warning' | 'accent';
  hint?: string;
}) {
  const cls = {
    brand: 'text-brand bg-brand/10 border-brand/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
  }[tone];

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-fg-muted uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn('w-8 h-8 rounded-lg border flex items-center justify-center', cls)}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-fg tabular-nums">
        {formatNumber(value)}
      </p>
      {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}

function PriorityRing({ value }: { value: number }) {
  const tone =
    value >= 80
      ? 'text-success border-success/40'
      : value >= 60
      ? 'text-accent border-accent/40'
      : value >= 40
      ? 'text-warning border-warning/40'
      : 'text-fg-subtle border-border';

  return (
    <div
      className={cn(
        'w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-semibold tabular-nums text-sm flex-shrink-0',
        tone
      )}
    >
      {value}
    </div>
  );
}

function ScoreCol({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-right min-w-[44px]">
      <p className="text-[10px] text-fg-subtle uppercase tracking-wider">{label}</p>
      <p className="font-mono text-fg tabular-nums">{value ?? '—'}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[10px] text-fg-subtle uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-fg tabular-nums">
        {formatNumber(value)}
      </p>
    </div>
  );
}
