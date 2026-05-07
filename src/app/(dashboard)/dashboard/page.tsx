import {
  Globe,
  FileText,
  Inbox,
  Network,
  CheckSquare,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hasPermission, ROLE_LABELS } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/page-header';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatRelativeTime } from '@/lib/utils';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await requireAuth();
  const { error } = await searchParams;
  const supabase = await createClient();

  // Hent stats parallelt. RLS sørger for at hver bruker bare ser hva de skal.
  const [
    sitesRes,
    domainsRes,
    articlesRes,
    publishedRes,
    leadsRes,
    newLeadsRes,
    tasksRes,
    recentArticlesRes,
  ] = await Promise.all([
    supabase.from('sites').select('id', { count: 'exact', head: true }),
    hasPermission(profile.role, 'domains:view')
      ? supabase.from('domains').select('id', { count: 'exact', head: true })
      : Promise.resolve({ count: 0 }),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    hasPermission(profile.role, 'leads:view')
      ? supabase.from('leads').select('id', { count: 'exact', head: true })
      : Promise.resolve({ count: 0 }),
    hasPermission(profile.role, 'leads:view')
      ? supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'new')
      : Promise.resolve({ count: 0 }),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .in('status', ['todo', 'in_progress']),
    supabase
      .from('articles')
      .select('id, title, status, updated_at, site_id')
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  const greeting = getGreeting();
  const firstName = profile.full_name?.split(' ')[0] ?? profile.email.split('@')[0];

  return (
    <>
      <PageHeader
        title={`${greeting}, ${firstName}`}
        description={`Logget inn som ${ROLE_LABELS[profile.role]}. Her er status på porteføljen.`}
      />

      {error === 'forbidden' && (
        <div className="mb-6 flex items-start gap-2 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20">
          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warning">
            Du har ikke tilgang til den siden. Kontakt en administrator hvis du
            mener det er feil.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          label="Nettsider"
          value={sitesRes.count ?? 0}
          icon={Globe}
          accent="brand"
        />
        {hasPermission(profile.role, 'domains:view') && (
          <DashboardCard
            label="Domener"
            value={domainsRes.count ?? 0}
            icon={Network}
            accent="accent"
          />
        )}
        <DashboardCard
          label="Artikler"
          value={articlesRes.count ?? 0}
          icon={FileText}
          accent="info"
          hint={`${publishedRes.count ?? 0} publisert`}
        />
        {hasPermission(profile.role, 'leads:view') && (
          <DashboardCard
            label="Nye leads"
            value={newLeadsRes.count ?? 0}
            icon={Inbox}
            accent="success"
            hint={`${leadsRes.count ?? 0} totalt`}
          />
        )}
        <DashboardCard
          label="Aktive oppgaver"
          value={tasksRes.count ?? 0}
          icon={CheckSquare}
          accent="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Siste aktivitet */}
        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-fg">Siste aktivitet</h2>
            <span className="text-xs text-fg-subtle">Sist oppdaterte artikler</span>
          </div>

          {recentArticlesRes.data && recentArticlesRes.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentArticlesRes.data.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-fg-subtle mt-0.5">
                      {formatRelativeTime(a.updated_at)}
                    </p>
                  </div>
                  <ArticleStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted py-6 text-center">
              Ingen artikler ennå. Opprett den første i Fase 3.
            </p>
          )}
        </div>

        {/* Hurtigtips */}
        <div className="panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-fg">Hurtigvalg</h2>
          </div>
          <div className="space-y-2">
            {hasPermission(profile.role, 'sites:create') && (
              <a
                href="/sites/new"
                className="block px-3 py-2.5 rounded-lg bg-bg-panel-light hover:bg-border text-sm text-fg transition-colors"
              >
                + Ny nettside
              </a>
            )}
            {hasPermission(profile.role, 'domains:create') && (
              <a
                href="/domains/import"
                className="block px-3 py-2.5 rounded-lg bg-bg-panel-light hover:bg-border text-sm text-fg transition-colors"
              >
                + Bulk import domener
              </a>
            )}
            {hasPermission(profile.role, 'tasks:create') && (
              <a
                href="/tasks/new"
                className="block px-3 py-2.5 rounded-lg bg-bg-panel-light hover:bg-border text-sm text-fg transition-colors"
              >
                + Ny oppgave
              </a>
            )}
            <a
              href="/growth"
              className="block px-3 py-2.5 rounded-lg bg-brand-subtle hover:bg-brand/20 text-sm text-brand transition-colors"
            >
              Se Growth-oversikt →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'God natt';
  if (h < 11) return 'God morgen';
  if (h < 17) return 'God dag';
  return 'God kveld';
}

function ArticleStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'info' | 'neutral'; label: string }> = {
    draft: { variant: 'neutral', label: 'Utkast' },
    review: { variant: 'warning', label: 'Review' },
    approved: { variant: 'info', label: 'Godkjent' },
    published: { variant: 'success', label: 'Publisert' },
    archived: { variant: 'neutral', label: 'Arkivert' },
    needs_update: { variant: 'warning', label: 'Trenger oppdatering' },
  };
  const m = map[status] ?? { variant: 'neutral' as const, label: status };
  return <StatusBadge variant={m.variant}>{m.label}</StatusBadge>;
}
