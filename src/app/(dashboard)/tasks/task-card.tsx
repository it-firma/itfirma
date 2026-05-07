'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Calendar, User as UserIcon, Globe } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { updateTaskStatusAction } from './actions';
import {
  PRIORITY_LABELS,
  PRIORITY_VARIANTS,
  TASK_TYPE_LABELS,
  KANBAN_COLUMNS,
  STATUS_LABELS,
} from './task-meta';
import type { Task, TaskStatus } from '@/types/database';

export interface TaskWithRelations extends Task {
  assigned_to_profile?: { full_name: string | null; email: string } | null;
  site?: { name: string; domain: string } | null;
  domain?: { domain_name: string } | null;
}

export function TaskCard({
  task,
  canMove,
}: {
  task: TaskWithRelations;
  canMove: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const move = (newStatus: TaskStatus) => {
    const fd = new FormData();
    fd.set('id', task.id);
    fd.set('status', newStatus);
    startTransition(async () => {
      await updateTaskStatusAction(fd);
    });
  };

  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  return (
    <div
      className={cn(
        'panel-light p-3 space-y-2 transition-opacity',
        pending && 'opacity-50'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-fg leading-snug">{task.title}</p>
        <StatusBadge variant={PRIORITY_VARIANTS[task.priority]} className="flex-shrink-0">
          {PRIORITY_LABELS[task.priority]}
        </StatusBadge>
      </div>

      {task.description && (
        <p className="text-xs text-fg-muted line-clamp-2">{task.description}</p>
      )}

      {task.task_type && (
        <p className="text-[10px] uppercase tracking-wider text-fg-subtle">
          {TASK_TYPE_LABELS[task.task_type]}
        </p>
      )}

      {/* Tilknytninger */}
      {(task.site || task.domain) && (
        <div className="flex flex-wrap gap-1.5">
          {task.site && (
            <Link
              href={`/sites/${task.site_id}/edit`}
              className="inline-flex items-center gap-1 text-[10px] text-fg-subtle hover:text-fg"
            >
              <Globe className="w-3 h-3" />
              {task.site.name}
            </Link>
          )}
          {task.domain && (
            <Link
              href={`/domains/${task.domain_id}/edit`}
              className="inline-flex items-center gap-1 text-[10px] text-fg-subtle hover:text-fg"
            >
              {task.domain.domain_name}
            </Link>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          {task.assigned_to_profile ? (
            <div
              title={
                task.assigned_to_profile.full_name ?? task.assigned_to_profile.email
              }
              className="w-5 h-5 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center text-[9px] font-semibold text-brand flex-shrink-0"
            >
              {getInitials(
                task.assigned_to_profile.full_name,
                task.assigned_to_profile.email
              )}
            </div>
          ) : (
            <div
              className="w-5 h-5 rounded-full bg-bg-panel border border-border flex items-center justify-center flex-shrink-0"
              title="Ikke tildelt"
            >
              <UserIcon className="w-3 h-3 text-fg-subtle" />
            </div>
          )}
          {task.due_date && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[10px]',
                isOverdue ? 'text-danger' : 'text-fg-subtle'
              )}
            >
              <Calendar className="w-3 h-3" />
              {formatDate(task.due_date)}
            </span>
          )}
        </div>

        {canMove && (
          <select
            value={task.status}
            onChange={(e) => move(e.target.value as TaskStatus)}
            disabled={pending}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] bg-bg-panel border border-border rounded px-1.5 py-0.5 text-fg-muted hover:text-fg focus:border-brand focus:ring-1 focus:ring-brand cursor-pointer"
          >
            {KANBAN_COLUMNS.concat(['approved', 'blocked']).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
