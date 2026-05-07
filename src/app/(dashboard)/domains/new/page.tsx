import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { DomainForm } from '../domain-form';
import { createDomainAction } from '../actions';

export const metadata = { title: 'Nytt domene' };

export default async function NewDomainPage() {
  await requirePermission('domains:create');
  const supabase = await createClient();

  const [sitesRes, profilesRes] = await Promise.all([
    supabase.from('sites').select('id, name, domain').order('name'),
    supabase.from('profiles').select('id, full_name, email').eq('is_active', true).order('full_name'),
  ]);

  return (
    <>
      <Link
        href="/domains"
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Tilbake til domener
      </Link>
      <PageHeader title="Nytt domene" description="Registrer et domene i porteføljen" />
      <DomainForm
        sites={sitesRes.data ?? []}
        profiles={profilesRes.data ?? []}
        action={createDomainAction}
        submitLabel="Opprett domene"
      />
    </>
  );
}
