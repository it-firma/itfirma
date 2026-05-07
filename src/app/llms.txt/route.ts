/**
 * /llms.txt - per-site fra sites-tabellen.
 *
 * Hvis llms_enabled er false, returnerer 404. Ellers genererer
 * en standard fra sitens metadata + publiserte pillar pages.
 */

import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const h = await headers();
  const host = h.get('host') ?? '';
  const cleanHost = host.replace(/^www\./, '');

  const supabase = createAdminClient();

  const { data: site } = await supabase
    .from('sites')
    .select('id, name, description, llms_enabled')
    .or(`domain.eq.${cleanHost},domain.eq.www.${cleanHost}`)
    .maybeSingle();

  if (!site) {
    return new Response('# Ingen llms.txt konfigurert\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (site.llms_enabled === false) {
    return new Response('Not Found', { status: 404 });
  }

  let content = `# ${site.name}\n\n`;
  if (site.description) content += `> ${site.description}\n\n`;

  // Hent publiserte pillar pages som hovedressurser
  const { data: pillarPages } = await supabase
    .from('pages')
    .select('title, slug')
    .eq('site_id', site.id)
    .eq('template', 'pillar')
    .eq('status', 'published')
    .limit(20);

  if (pillarPages && pillarPages.length > 0) {
    content += `## Hovedressurser\n`;
    for (const p of pillarPages) {
      content += `- [${p.title}](/${p.slug})\n`;
    }
    content += `\n`;
  }

  // Hent kategorier
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('site_id', site.id)
    .limit(40);

  if (categories && categories.length > 0) {
    content += `## Kategorier\n`;
    for (const c of categories) {
      content += `- [${c.name}](/kategori/${c.slug})\n`;
    }
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
