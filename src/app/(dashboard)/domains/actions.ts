'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth';
import {
  domainSchema,
  flattenZodErrors,
  nullifyEmpty,
  type DomainInput,
} from '@/lib/validators';

export type DomainFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Partial<DomainInput>;
};

function parseFormData(formData: FormData): DomainInput {
  const get = (k: string) => (formData.get(k) ?? '') as string;
  return domainSchema.parse({
    domain_name: get('domain_name'),
    tld: get('tld'),
    category: get('category'),
    industry: get('industry'),
    status: get('status'),
    registrar: get('registrar'),
    renewal_date: get('renewal_date'),
    purchase_price: get('purchase_price'),
    estimated_value: get('estimated_value'),
    asking_price: get('asking_price'),
    leasing_price_monthly: get('leasing_price_monthly'),
    lead_potential_score: get('lead_potential_score'),
    traffic_potential_score: get('traffic_potential_score'),
    seo_potential_score: get('seo_potential_score'),
    commercial_intent_score: get('commercial_intent_score'),
    content_score: get('content_score'),
    project_site_id: get('project_site_id'),
    assigned_to: get('assigned_to'),
    notes: get('notes'),
    dns_status: get('dns_status'),
    nameserver_status: get('nameserver_status'),
    ssl_status: get('ssl_status'),
    built_status: get('built_status'),
    traffic_status: get('traffic_status'),
    lead_status: get('lead_status'),
  });
}

function rawValues(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    out[k] = v;
  }
  return out;
}

export async function createDomainAction(
  _prev: DomainFormState,
  formData: FormData
): Promise<DomainFormState> {
  await requirePermission('domains:create');

  let parsed: DomainInput;
  try {
    parsed = parseFormData(formData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        fieldErrors: flattenZodErrors(err),
        values: rawValues(formData) as Partial<DomainInput>,
      };
    }
    return { error: 'Validering feilet' };
  }

  // Auto-derive TLD hvis tomt
  if (!parsed.tld) {
    const parts = parsed.domain_name.split('.');
    if (parts.length >= 2) parsed.tld = parts[parts.length - 1];
  }

  const supabase = await createClient();
  const insertData = nullifyEmpty(parsed);

  const { data, error } = await supabase
    .from('domains')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return {
        fieldErrors: { domain_name: 'Dette domenet finnes allerede' },
        values: rawValues(formData) as Partial<DomainInput>,
      };
    }
    return { error: error.message };
  }

  revalidatePath('/domains');
  revalidatePath('/growth');
  redirect(`/domains/${data.id}/edit`);
}

export async function updateDomainAction(
  id: string,
  _prev: DomainFormState,
  formData: FormData
): Promise<DomainFormState> {
  await requirePermission('domains:edit');

  let parsed: DomainInput;
  try {
    parsed = parseFormData(formData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        fieldErrors: flattenZodErrors(err),
        values: rawValues(formData) as Partial<DomainInput>,
      };
    }
    return { error: 'Validering feilet' };
  }

  const supabase = await createClient();
  const updateData = nullifyEmpty(parsed);

  const { error } = await supabase.from('domains').update(updateData).eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return {
        fieldErrors: { domain_name: 'Dette domenet finnes allerede' },
        values: rawValues(formData) as Partial<DomainInput>,
      };
    }
    return { error: error.message };
  }

  revalidatePath('/domains');
  revalidatePath(`/domains/${id}/edit`);
  revalidatePath('/growth');
  return { values: parsed };
}

export async function deleteDomainAction(id: string) {
  await requirePermission('domains:delete');
  const supabase = await createClient();
  const { error } = await supabase.from('domains').delete().eq('id', id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/domains');
  revalidatePath('/growth');
  redirect('/domains');
}

// =============================================================================
// Bulk import - for å fylle på 2000+ domener
// =============================================================================

const bulkImportSchema = z.object({
  text: z.string().min(1, 'Lim inn minst ett domene'),
  default_status: z
    .enum([
      'owned',
      'not_started',
      'planned',
      'in_build',
      'live',
      'ranking',
      'lead_machine',
      'for_lease',
      'reserved',
      'sold',
      'paused',
      'expired_watch',
    ])
    .default('owned'),
  default_registrar: z.string().optional(),
});

export type BulkImportState = {
  error?: string;
  added?: number;
  skipped?: number;
  invalid?: string[];
};

export async function bulkImportDomainsAction(
  _prev: BulkImportState,
  formData: FormData
): Promise<BulkImportState> {
  await requirePermission('domains:create');

  const parsed = bulkImportSchema.safeParse({
    text: formData.get('text'),
    default_status: formData.get('default_status'),
    default_registrar: formData.get('default_registrar') ?? '',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Ugyldig input' };
  }

  // Splitt på linje, komma og semikolon
  const candidates = parsed.data.text
    .split(/[\n,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const domainRegex = /^[a-z0-9æøå][a-z0-9æøå-]*(\.[a-z0-9æøå][a-z0-9æøå-]*)+$/i;
  const valid: { domain_name: string; tld: string | null; status: string; registrar: string | null }[] = [];
  const invalid: string[] = [];

  for (const c of candidates) {
    const cleaned = c.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domainRegex.test(cleaned)) {
      invalid.push(c);
      continue;
    }
    const parts = cleaned.split('.');
    valid.push({
      domain_name: cleaned,
      tld: parts.length >= 2 ? parts[parts.length - 1] : null,
      status: parsed.data.default_status,
      registrar: parsed.data.default_registrar || null,
    });
  }

  if (valid.length === 0) {
    return { error: 'Fant ingen gyldige domener', invalid };
  }

  const supabase = await createClient();

  // Sjekk hvilke som finnes fra før
  const names = valid.map((v) => v.domain_name);
  const { data: existing } = await supabase
    .from('domains')
    .select('domain_name')
    .in('domain_name', names);

  const existingSet = new Set((existing ?? []).map((e) => e.domain_name));
  const toInsert = valid.filter((v) => !existingSet.has(v.domain_name));

  if (toInsert.length > 0) {
    // Sett inn i batches på 500 for å unngå timeout
    const BATCH = 500;
    for (let i = 0; i < toInsert.length; i += BATCH) {
      const slice = toInsert.slice(i, i + BATCH);
      const { error } = await supabase.from('domains').insert(slice);
      if (error) {
        return {
          error: `Importerte ${i} av ${toInsert.length} før feil: ${error.message}`,
          added: i,
          skipped: existingSet.size,
          invalid,
        };
      }
    }
  }

  revalidatePath('/domains');
  revalidatePath('/growth');
  revalidatePath('/dashboard');

  return {
    added: toInsert.length,
    skipped: existingSet.size,
    invalid,
  };
}
