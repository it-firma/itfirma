import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { DeleteButton } from '@/components/ui/delete-button';
import { SiteForm } from '../../site-form';
import { updateSiteAction, deleteSiteAction } from '../../actions';
import type { Site } from '@/types/database';

export const metadata = { title: 'Rediger nettside' };

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requirePermission('sites:edit');
  const { id } = await params;
  const supabase = await createClient();

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single();

  if (!site) notFound();

  const updateAction = updateSiteAction.bind(null, id);
  const deleteThisSite = async () => {
    'use server';
    return deleteSiteAction(id);
  };
  const typedSite = site as Site;
  const canDelete = hasPermission(profile.role, 'sites:delete');

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
        title={typedSite.name}
        description={
          <span className="inline-flex items-center gap-1.5">
            <a
              href={`https://${typedSite.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-muted hover:text-fg inline-flex items-center gap-1"
            >
              {typedSite.domain}
              <ExternalLink className="w-3 h-3" />
            </a>
          </span>
        }
        action={
          <div className="flex items-center gap-2">
            <StatusBadge variant="info">{typedSite.status}</StatusBadge>
            {canDelete && (
              <DeleteButton action={deleteThisSite} itemLabel={typedSite.name} />
            )}
          </div>
        }
      />
      <SiteForm
        site={typedSite}
        action={updateAction}
        submitLabel="Lagre endringer"
        successMessage="Endringer lagret"
      />
    </>
  );
}
