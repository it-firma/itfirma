import { z } from 'zod';

// =============================================================================
// SITES
// =============================================================================

const SITE_STATUS = ['active', 'draft', 'paused', 'archived'] as const;

export const siteSchema = z.object({
  name: z.string().min(1, 'Navn er påkrevd').max(120, 'Maks 120 tegn'),
  domain: z
    .string()
    .min(1, 'Domene er påkrevd')
    .max(253, 'For langt')
    .regex(
      /^[a-z0-9æøå][a-z0-9æøå-]*(\.[a-z0-9æøå][a-z0-9æøå-]*)+$/i,
      'Må være et gyldig domene (f.eks. eksempel.no)'
    ),
  slug: z
    .string()
    .min(1, 'Slug er påkrevd')
    .max(80, 'Maks 80 tegn')
    .regex(/^[a-z0-9-]+$/, 'Bruk kun a-z, 0-9 og bindestrek'),
  description: z.string().max(500, 'Maks 500 tegn').optional().or(z.literal('')),
  logo_url: z.string().url('Må være en gyldig URL').optional().or(z.literal('')),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Må være en hex-farge (#RRGGBB)')
    .optional()
    .or(z.literal('')),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Må være en hex-farge (#RRGGBB)')
    .optional()
    .or(z.literal('')),
  status: z.enum(SITE_STATUS),
  language: z.string().min(2).max(8).default('no'),
  country: z.string().min(2).max(8).default('NO'),
  default_seo_title: z.string().max(70).optional().or(z.literal('')),
  default_seo_description: z.string().max(170).optional().or(z.literal('')),
  default_og_image: z.string().url().optional().or(z.literal('')),
  llms_enabled: z.boolean().default(true),
  sitemap_enabled: z.boolean().default(true),
  robots_enabled: z.boolean().default(true),
});

export type SiteInput = z.infer<typeof siteSchema>;

// =============================================================================
// DOMAINS
// =============================================================================

const DOMAIN_STATUS = [
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
] as const;

const scoreField = z
  .union([
    z.coerce.number().int().min(0).max(100),
    z.literal('').transform(() => null),
  ])
  .nullable()
  .optional();

const priceField = z
  .union([
    z.coerce.number().min(0),
    z.literal('').transform(() => null),
  ])
  .nullable()
  .optional();

export const domainSchema = z.object({
  domain_name: z
    .string()
    .min(1, 'Domene er påkrevd')
    .max(253, 'For langt')
    .regex(
      /^[a-z0-9æøå][a-z0-9æøå-]*(\.[a-z0-9æøå][a-z0-9æøå-]*)+$/i,
      'Må være et gyldig domene'
    ),
  tld: z.string().max(20).optional().or(z.literal('')),
  category: z.string().max(80).optional().or(z.literal('')),
  industry: z.string().max(80).optional().or(z.literal('')),
  status: z.enum(DOMAIN_STATUS),
  registrar: z.string().max(80).optional().or(z.literal('')),
  renewal_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Må være ÅÅÅÅ-MM-DD')
    .optional()
    .or(z.literal('')),
  purchase_price: priceField,
  estimated_value: priceField,
  asking_price: priceField,
  leasing_price_monthly: priceField,
  lead_potential_score: scoreField,
  traffic_potential_score: scoreField,
  seo_potential_score: scoreField,
  commercial_intent_score: scoreField,
  content_score: scoreField,
  project_site_id: z.string().uuid().optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  // Driftstatus - frie tekstfelter, foreslåtte verdier i UI
  dns_status: z.string().max(40).optional().or(z.literal('')),
  nameserver_status: z.string().max(40).optional().or(z.literal('')),
  ssl_status: z.string().max(40).optional().or(z.literal('')),
  built_status: z.string().max(40).optional().or(z.literal('')),
  traffic_status: z.string().max(40).optional().or(z.literal('')),
  lead_status: z.string().max(40).optional().or(z.literal('')),
});

export type DomainInput = z.infer<typeof domainSchema>;

// =============================================================================
// TASKS
// =============================================================================

const TASK_PRIORITY = ['low', 'medium', 'high', 'urgent'] as const;
const TASK_STATUS = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'approved',
  'done',
  'blocked',
] as const;
const TASK_TYPE = [
  'write_article',
  'edit_article',
  'seo_review',
  'aeo_review',
  'geo_review',
  'llm_review',
  'publish_article',
  'update_prices',
  'check_domain',
  'follow_up_lead',
  'build_landing_page',
  'upload_media',
  'technical_fix',
  'internal_linking',
  'add_faq',
  'add_sources',
  'update_meta',
] as const;

export const taskSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  task_type: z.enum(TASK_TYPE).optional(),
  priority: z.enum(TASK_PRIORITY).default('medium'),
  status: z.enum(TASK_STATUS).default('backlog'),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Må være ÅÅÅÅ-MM-DD')
    .optional()
    .or(z.literal('')),
  site_id: z.string().uuid().optional().or(z.literal('')),
  domain_id: z.string().uuid().optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
  related_article_id: z.string().uuid().optional().or(z.literal('')),
  related_page_id: z.string().uuid().optional().or(z.literal('')),
});

export type TaskInput = z.infer<typeof taskSchema>;

// =============================================================================
// Helpers
// =============================================================================

/**
 * Konverter tomme strenger til null for valgfrie felter slik at
 * de havner som NULL i databasen, ikke ''.
 */
export function nullifyEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const k in out) {
    if (out[k] === '') {
      (out as Record<string, unknown>)[k] = null;
    }
  }
  return out;
}

/**
 * Hent feltfeil fra et Zod-resultat som flat record.
 */
export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
