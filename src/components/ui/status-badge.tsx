import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand' | 'accent';

const VARIANT_CLASSES: Record<Variant, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-bg-panel-light text-fg-muted border-border',
  brand: 'bg-brand/10 text-brand border-brand/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
};

export function StatusBadge({
  children,
  variant = 'neutral',
  className,
  dot = false,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full bg-current')} />}
      {children}
    </span>
  );
}
