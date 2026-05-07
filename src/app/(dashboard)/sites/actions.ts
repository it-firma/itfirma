'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth';
import {
  siteSchema,
  flattenZodErrors,
  nullifyEmpty,
  type SiteInput,
} from '@/lib/validators';

export type SiteFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Partial<SiteInput>;
};

function parseFormData(formData: FormData): SiteInput {
  return siteSchema.parse({
    name: formData.get('name'),
    domain: formData.get('domain'),
    slug: formData.get('slug'),
    description: formData.get('description') ?? '',
    logo_url: formData.get('logo_url') ?? '',
    primary_color: formData.get('primary_color') ?? '',
    secondary_color: formData.get('secondary_color') ?? '',
    status: formData.get('status'),
    language: formData.get('language') ?? 'no',
    country: formData.get('country') ?? 'NO',
    default_seo_title: formData.get('default_seo_title') ?? '',
    default_seo_description: formData.get('default_seo_description') ?? '',
    default_og_image: formData.get('default_og_image') ?? '',
    llms_enabled: formData.get('llms_enabled') === 'on',
    sitemap_enabled: formData.get('sitemap_enabled') === 'on',
    robots_enabled: formData.get('robots_enabled') === 'on',
  });
}

function rawValues(formData: FormData): Partial<SiteInput> {
  return {
    name: (formData.get('name') as string) ?? '',
    domain: (formData.get('domain') as string) ?? '',
    slug: (formData.get('slug') as string) ?? '',
    description: (formData.get('description') as string) ?? '',
    logo_url: (formData.get('logo_url') as string) ?? '',
    primary_color: (formData.get('primary_color') as string) ?? '',
    secondary_color: (formData.get('secondary_color') as string) ?? '',
    status: (formData.get('status') as SiteInput['status']) ?? 'draft',
    language: (formData.get('language') as string) ?? 'no',
    country: (formData.get('country') as string) ?? 'NO',
    default_seo_title: (formData.get('default_seo_title') as string) ?? '',
    default_seo_description: (formData.get('default_seo_description') as string) ?? '',
    default_og_image: (formData.get('default_og_image') as string) ?? '',
    llms_enabled: formData.get('llms_enabled') === 'on',
    sitemap_enabled: formData.get('sitemap_enabled') === 'on',
    robots_enabled: formData.get('robots_enabled') === 'on',
  };
}

export async function createSiteAction(
  _prev: SiteFormState,
  formData: FormData
): Promise<SiteFormState> {
  await requirePermission('sites:create');

  let parsed: SiteInput;
  try {
    parsed = parseFormData(formData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        fieldErrors: flattenZodErrors(err),
        values: rawValues(formData),
      };
    }
    return { error: 'Validering feilet', values: rawValues(formData) };
  }

  const supabase = await createClient();
  const insertData = nullifyEmpty(parsed);

  const { data, error } = await supabase
    .from('sites')
    .insert(insertData)
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      const field = error.message.includes('slug') ? 'slug' : 'domain';
      return {
        fieldErrors: {
          [field]: `Dette ${field === 'slug' ? 'kortnavnet' : 'domenet'} finnes allerede`,
        },
        values: rawValues(formData),
      };
    }
    return { error: error.message, values: rawValues(formData) };
  }

  // Opprett tomme settings for sitet
  await supabase.from('settings').insert({
    site_id: data.id,
    primary_color: parsed.primary_color || '#2563FF',
    secondary_color: parsed.secondary_color || '#27D0C3',
    language: parsed.language,
    country: parsed.country,
  });

  revalidatePath('/sites');
  revalidatePath('/dashboard');
  redirect(`/sites/${data.id}/edit`);
}

export async function updateSiteAction(
  id: string,
  _prev: SiteFormState,
  formData: FormData
): Promise<SiteFormState> {
  await requirePermission('sites:edit');

  let parsed: SiteInput;
  try {
    parsed = parseFormData(formData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        fieldErrors: flattenZodErrors(err),
        values: rawValues(formData),
      };
    }
    return { error: 'Validering feilet', values: rawValues(formData) };
  }

  const supabase = await createClient();
  const updateData = nullifyEmpty(parsed);

  const { error } = await supabase.from('sites').update(updateData).eq('id', id);

  if (error) {
    if (error.code === '23505') {
      const field = error.message.includes('slug') ? 'slug' : 'domain';
      return {
        fieldErrors: {
          [field]: `Dette ${field === 'slug' ? 'kortnavnet' : 'domenet'} finnes allerede`,
        },
        values: rawValues(formData),
      };
    }
    return { error: error.message, values: rawValues(formData) };
  }

  revalidatePath('/sites');
  revalidatePath(`/sites/${id}/edit`);
  revalidatePath('/dashboard');
  return { values: parsed };
}

export async function archiveSiteAction(id: string) {
  await requirePermission('sites:edit');
  const supabase = await createClient();
  await supabase.from('sites').update({ status: 'archived' }).eq('id', id);
  revalidatePath('/sites');
  revalidatePath('/dashboard');
}

export async function activateSiteAction(id: string) {
  await requirePermission('sites:edit');
  const supabase = await createClient();
  await supabase.from('sites').update({ status: 'active' }).eq('id', id);
  revalidatePath('/sites');
  revalidatePath('/dashboard');
}

export async function deleteSiteAction(id: string) {
  await requirePermission('sites:delete');
  const supabase = await createClient();
  const { error } = await supabase.from('sites').delete().eq('id', id);
  if (error) {
    // Mest sannsynlig FK-violation: artikler/sider/domener peker på sitet
    return { error: error.message };
  }
  revalidatePath('/sites');
  revalidatePath('/dashboard');
  redirect('/sites');
}
