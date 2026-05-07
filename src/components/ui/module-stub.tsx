import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

export function ModuleStub({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="panel">
        <EmptyState
          icon={Construction}
          title="Modul under utvikling"
          description={`Bygges i ${phase}. Modulen er reservert i navigasjon og rolletilgang slik at det ikke skal være noe brudd når den lanseres.`}
        />
      </div>
    </>
  );
}
