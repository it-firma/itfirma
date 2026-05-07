import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { PageHeader } from '@/components/ui/page-header';
import { SiteForm } from '../site-form';
import { createSiteAction } from '../actions';

export const metadata = { title: 'Ny nettside' };

export default async function NewSitePage() {
  await requirePermission('sites:create');

  return (
    <>
      <Link
        href="/sites"
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Tilbake til nettsider
      </Link>
      <PageHeader
        title="Ny nettside"
        description="Legg til en nettside i porteføljen"
      />
      <SiteForm action={createSiteAction} submitLabel="Opprett nettside" />
    </>
  );
}
