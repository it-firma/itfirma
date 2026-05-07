import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { NewTaskForm } from './new-task-form';

export const metadata = { title: 'Ny oppgave' };

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string; domain?: string }>;
}) {
  await requirePermission('tasks:create');
  const sp = await searchParams;
  const supabase = await createClient();

  const [sitesRes, domainsRes, profilesRes, articlesRes, pagesRes] = await Promise.all([
    supabase.from('sites').select('id, name').neq('status', 'archived').order('name'),
    supabase.from('domains').select('id, domain_name').order('domain_name').limit(500),
    supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('is_active', true)
      .order('full_name'),
    supabase.from('articles').select('id, title').order('updated_at', { ascending: false }).limit(200),
    supabase.from('pages').select('id, title').order('updated_at', { ascending: false }).limit(200),
  ]);

  return (
    <>
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Tilbake til oppgaver
      </Link>
      <PageHeader title="Ny oppgave" description="Opprett og tildel arbeid" />
      <NewTaskForm
        sites={sitesRes.data ?? []}
        domains={domainsRes.data ?? []}
        profiles={profilesRes.data ?? []}
        articles={articlesRes.data ?? []}
        pages={pagesRes.data ?? []}
        defaultSiteId={sp.site}
        defaultDomainId={sp.domain}
      />
    </>
  );
}
