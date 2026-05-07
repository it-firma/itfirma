import type { LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';

export function PhaseStub({
  title,
  description,
  phase,
  icon,
  features,
}: {
  title: string;
  description: string;
  phase: 2 | 3 | 4 | 5 | 6;
  icon: LucideIcon;
  features: string[];
}) {
  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={<StatusBadge variant="info">Fase {phase}</StatusBadge>}
      />
      <div className="panel">
        <EmptyState
          icon={icon}
          title={`Fase ${phase}: ${title}`}
          description="Denne modulen bygges ut i en senere fase. Database-skjemaet er klart, men UI-et og Server Actions kommer i neste leveranse."
          action={
            <ul className="text-left text-sm text-fg-muted space-y-1.5 inline-block">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-brand mt-1">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          }
        />
      </div>
    </>
  );
}
