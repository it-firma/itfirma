/**
 * /robots.txt - blokkerer panel-domenet for crawling, peker
 * frontend-domener til sitemap.
 */

import { headers } from 'next/headers';

export const revalidate = 86400; // 24 timer

export async function GET(): Promise<Response> {
  const h = await headers();
  const host = h.get('host') ?? '';
  const cleanHost = host.replace(/^www\./, '');

  // Panel-domene: blokker alt
  if (cleanHost.startsWith('panel.') || cleanHost === 'panel.itfirma.no') {
    const txt = `User-agent: *
Disallow: /
`;
    return new Response(txt, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Frontend-domener: tillat alt og pek til sitemap
  const txt = `User-agent: *
Allow: /

Sitemap: https://${cleanHost}/sitemap.xml
`;
  return new Response(txt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
