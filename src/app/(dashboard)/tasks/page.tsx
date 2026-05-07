import Link from 'next/link';
import { Plus, CheckSquare, User as UserIcon } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterBar } from '@/components/tables/filter-bar';
import { TaskCard, type TaskWithRelations } from './task-card';
import { KANBAN_COLUMNS, STATUS_LABELS } from './task-meta';
import { cn, formatNumber } from '@/lib/utils';
import type { TaskStatus } from '@/types/database';

export const metadata = { title: 'Oppgaver' };

const VIEW_OPTIONS = ['kanban', 'mine'] as const;
type View = (typeof VIEW_OPTIONS)[number];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    site?: string;
    assigned?: string;
  }>;
}) {
  const { profile, userId } = await requirePermission('tasks:view');
  const sp = await searchParams;
  const supabase = await createClient();

  const view: View = (VIEW_OPTIONS as readonly string[]).includes(sp.view ?? '')
    ? (sp.view as View)
    : 'kanban';

  const canCreate = hasPermission(profile.role, 'tasks:create');
  const canManage = hasPermission(profile.role, 'tasks:assign');

  // Hent oppgaver med relations
  let query = supabase
    .from('tasks')
    .select(
      `
      *,
      assigned_to_profile:profiles!assigned_to(full_name, email),
      site:sites(name, domain),
      domain:domains(domain_name)
    `
    )
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true, nullsFirst: false });

  if (view === 'mine') {
    query = query.eq('assigned_to', userId);
  }
  if (sp.site && sp.site !== 'all') {
    query = query.eq('site_id', sp.site);
  }
  if (sp.assigned && sp.assigned !== 'all') {
    if (sp.assigned === 'unassigned') {
      query = query.is('assigned_to', null);
    } else {
      query = query.eq('assigned_to', sp.assigned);
    }
  }

  const { data: tasks } = await query;
  const allTasks = (tasks ?? []) as unknown as TaskWithRelations[];

  // Filter options
  const [sitesRes, profilesRes] = await Promise.all([
    supabase.from('sites').select('id, name').order('name'),
    canManage
      ? supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('is_active', true)
          .order('full_name')
      : Promise.resolve({ data: [] }),
  ]);

  // Gruppér per status
  const byStatus = allTasks.reduce<Record<TaskStatus, TaskWithRelations[]>>(
    (acc, t) => {
      if (!acc[t.status]) acc[t.status] = [];
      acc[t.status].push(t);
      return acc;
    },
    {} as Record<TaskStatus, TaskWithRelations[]>
  );

  const blockedCount = byStatus['blocked']?.length ?? 0;

  return (
    <>
      <PageHeader
        title="Oppgaver"
        description={`${formatNumber(allTasks.length)} oppgave${allTasks.length === 1 ? '' : 'r'}${
          blockedCount > 0 ? ` · ${blockedCount} blokkert` : ''
        }`}
        action={
          canCreate ? (
            <Link href="/tasks/new">
              <Button>
                <Plus className="w-4 h-4" />
                Ny oppgave
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-5">
        <ViewLink view="kanban" current={view}>
          Alle
        </ViewLink>
        <ViewLink view="mine" current={view}>
          <UserIcon className="w-3.5 h-3.5" />
          Mine
        </ViewLink>
      </div>

      <FilterBar
        searchPlaceholder="Filter…"
        filters={[
          {
            name: 'site',
            label: 'nettsider',
            options: (sitesRes.data ?? []).map((s) => ({ value: s.id, label: s.name })),
          },
          ...(canManage
            ? [
                {
                  name: 'assigned',
                  label: 'tildelt',
                  options: [
                    { value: 'unassigned', label: 'Ikke tildelt' },
                    ...(profilesRes.data ?? []).map((p) => ({
                      value: p.id,
                      label: p.full_name ?? p.email,
                    })),
                  ],
                },
              ]
            : []),
        ]}
      />

      {allTasks.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={CheckSquare}
            title={view === 'mine' ? 'Ingen oppgaver tildelt deg' : 'Ingen oppgaver'}
            description={
              view === 'mine'
                ? 'Du har ingen aktive oppgaver akkurat nå.'
                : canCreate
                ? 'Opprett den første oppgaven for å fordele arbeid.'
                : 'Vent på at en manager tildeler oppgaver.'
            }
            action={
              canCreate ? (
                <Link href="/tasks/new">
                  <Button>
                    <Plus className="w-4 h-4" />
                    Ny oppgave
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <KanbanBoard
          byStatus={byStatus}
          canMove={canCreate || view === 'mine'}
        />
      )}
    </>
  );
}

// -----------------------------------------------------------------------------

function ViewLink({
  view,
  current,
  children,
}: {
  view: View;
  current: View;
  children: React.ReactNode;
}) {
  const isActive = view === current;
  return (
    <Link
      href={`/tasks?view=${view}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-bg-panel-light text-fg border border-border-light'
          : 'text-fg-muted hover:text-fg hover:bg-bg-panel-light/50'
      )}
    >
      {children}
    </Link>
  );
}

function KanbanBoard({
  byStatus,
  canMove,
}: {
  byStatus: Record<TaskStatus, TaskWithRelations[]>;
  canMove: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {KANBAN_COLUMNS.map((status) => {
        const tasks = byStatus[status] ?? [];
        return (
          <div key={status} className="flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                {STATUS_LABELS[status]}
              </h3>
              <span className="text-xs text-fg-subtle tabular-nums">
                {tasks.length}
              </span>
            </div>
            <div className="bg-bg-panel/50 rounded-lg border border-border p-2 space-y-2 min-h-[200px]">
              {tasks.length === 0 ? (
                <p className="text-xs text-fg-subtle py-4 text-center">
                  Tom kolonne
                </p>
              ) : (
                tasks.map((t) => <TaskCard key={t.id} task={t} canMove={canMove} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
