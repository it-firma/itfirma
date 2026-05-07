import type { LucideIcon } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

export function DashboardCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  accent = 'brand',
  className,
}: {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  hint?: string;
  accent?: 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  const accentColor = {
    brand: 'text-brand bg-brand/10 border-brand/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    danger: 'text-danger bg-danger/10 border-danger/20',
    info: 'text-info bg-info/10 border-info/20',
  }[accent];

  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <div className={cn('panel p-5 hover:border-border-light transition-colors', className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-fg-muted uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center', accentColor)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-fg tabular-nums">{displayValue}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-success' : 'text-danger'
            )}
          >
            {trend.value >= 0 ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}
