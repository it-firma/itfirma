import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { DeleteButton } from '@/components/ui/delete-button';
import { DomainForm } from '../../domain-form';
import { updateDomainAction, deleteDomainAction } from '../../actions';
import { recommendNextAction } from '@/lib/scores';
import type { Domain } from '@/types/database';

export const metadata = { title: 'Rediger domene' };

export default async function EditDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requirePermission('domains:edit');
  const { id } = await params;
  const supabase = await createClient();

  const [domainRes, sitesRes, profilesRes] = await Promise.all([
    supabase.from('domains').select('*').eq('id', id).single(),
    supabase.from('sites').select('id, name, domain').order('name'),
    supabase.from('profiles').select('id, full_name, email').eq('is_active', true).order('full_name'),
  ]);

  if (!domainRes.data) notFound();
  const domain = domainRes.data as Domain;
  const updateAction = updateDomainAction.bind(null, id);
  const deleteThisDomain = async () => {
    'use server';
    return deleteDomainAction(id);
  };
  const recommendation = recommendNextAction(domain);
  const canDelete = hasPermission(profile.role, 'domains:delete');

  return (
    <>
      <Link
        href="/domains"
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Tilbake til domener
      </Link>
      <PageHeader
        title={domain.domain_name}
        description="Rediger detaljer og scores"
        action={
          <div className="flex items-center gap-2">
            {domain.priority_score != null && (
              <StatusBadge variant="brand">Priority {domain.priority_score}</StatusBadge>
            )}
            <StatusBadge variant="info">{domain.status}</StatusBadge>
            {canDelete && (
              <DeleteButton action={deleteThisDomain} itemLabel={domain.domain_name} />
            )}
          </div>
        }
      />

      {recommendation && (
        <div className="panel p-4 mb-5 max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-fg-subtle mb-1">
            Anbefalt neste handling
          </p>
          <p className="text-sm text-fg">{recommendation}</p>
        </div>
      )}

      <DomainForm
        domain={domain}
        sites={sitesRes.data ?? []}
        profiles={profilesRes.data ?? []}
        action={updateAction}
        submitLabel="Lagre endringer"
        successMessage="Endringer lagret"
      />
    </>
  );
}
