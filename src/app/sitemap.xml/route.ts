/**
 * /sitemap.xml - serveres per nettside basert på Host-headeren.
 */

import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export async function GET(): Promise<Response> {
  const h = await headers();
  const host = h.get('host') ?? '';

  const supabase = createAdminClient();
  const cleanHost = host.replace(/^www\./, '');

  const { data: site } = await supabase
    .from('sites')
    .select('id, slug, domain, sitemap_enabled')
    .or(`domain.eq.${cleanHost},domain.eq.www.${cleanHost}`)
    .maybeSingle();

  const baseUrl = `https://${cleanHost}`;
  const urls: UrlEntry[] = [{ loc: baseUrl, changefreq: 'daily', priority: 1.0 }];

  if (site && site.sitemap_enabled !== false) {
    const [articlesRes, pagesRes, categoriesRes] = await Promise.all([
      supabase
        .from('articles')
        .select('slug, updated_at, published_at')
        .eq('site_id', site.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10000),
      supabase
        .from('pages')
        .select('slug, updated_at')
        .eq('site_id', site.id)
        .eq('status', 'published'),
      supabase.from('categories').select('slug, updated_at').eq('site_id', site.id),
    ]);

    for (const a of articlesRes.data ?? []) {
      urls.push({
        loc: `${baseUrl}/${a.slug}`,
        lastmod: (a.updated_at ?? a.published_at)?.slice(0, 10),
        changefreq: 'weekly',
        priority: 0.8,
      });
    }

    for (const p of pagesRes.data ?? []) {
      urls.push({
        loc: `${baseUrl}/${p.slug}`,
        lastmod: p.updated_at?.slice(0, 10),
        changefreq: 'monthly',
        priority: 0.7,
      });
    }

    for (const c of categoriesRes.data ?? []) {
      urls.push({
        loc: `${baseUrl}/kategori/${c.slug}`,
        lastmod: c.updated_at?.slice(0, 10),
        changefreq: 'weekly',
        priority: 0.6,
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>${
        u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''
      }${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${
        u.priority != null ? `\n    <priority>${u.priority.toFixed(1)}</priority>` : ''
      }
  </url>`
    )
    .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
