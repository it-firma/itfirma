/**
 * POST /api/leads/submit
 *
 * Public endpoint for kontaktskjemaer på frontend-nettsidene.
 * Krever ingen autentisering - bruker service role internt.
 *
 * Body (JSON):
 *   site_id: string  (uuid - må eksistere)
 *   name?: string
 *   email?: string
 *   phone?: string
 *   company?: string
 *   message?: string
 *   _hp?: string   (honeypot - skal være tom)
 *
 * Returns: { ok: true } eller { error: string }
 */

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import type { NextRequest } from 'next/server';

const submitSchema = z.object({
  site_id: z.string().uuid(),
  name: z.string().max(200).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(40).optional(),
  company: z.string().max(200).optional(),
  message: z.string().max(5000).optional(),
  _hp: z.string().optional(),
});

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Ugyldig JSON' }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  // Honeypot - bots fyller alle felt, returner OK uten å lagre
  if (parsed.data._hp && parsed.data._hp.length > 0) {
    return Response.json({ ok: true });
  }

  if (!parsed.data.email && !parsed.data.phone) {
    return Response.json(
      { error: 'E-post eller telefon må oppgis' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('id', parsed.data.site_id)
    .maybeSingle();

  if (!site) {
    return Response.json({ error: 'Ukjent site' }, { status: 400 });
  }

  const { error } = await supabase.from('leads').insert({
    site_id: parsed.data.site_id,
    name: parsed.data.name ?? null,
    email: parsed.data.email ?? null,
    phone: parsed.data.phone ?? null,
    company: parsed.data.company ?? null,
    message: parsed.data.message ?? null,
    status: 'new',
    source_url: req.headers.get('referer') ?? null,
  });

  if (error) {
    return Response.json({ error: 'Kunne ikke lagre' }, { status: 500 });
  }

  return Response.json(
    { ok: true },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
