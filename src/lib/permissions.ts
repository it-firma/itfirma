import type { UserRole } from '@/types/database';

/**
 * Permission system.
 *
 * Hver "permission" er en logisk handling. Dette er sannhet for
 * UI-rendering (vis/skjul knapper, menyer). Backend RLS er det
 * som faktisk håndhever tilgang i databasen.
 *
 * Hold dette synkronisert med RLS policies i 0002_rls_policies.sql.
 */

export type Permission =
  // Sites
  | 'sites:view'
  | 'sites:create'
  | 'sites:edit'
  | 'sites:delete'
  // Articles
  | 'articles:view'
  | 'articles:create'
  | 'articles:edit'
  | 'articles:edit_own'
  | 'articles:publish'
  | 'articles:delete'
  // Pages
  | 'pages:view'
  | 'pages:create'
  | 'pages:edit'
  | 'pages:publish'
  | 'pages:delete'
  // Categories & Topics
  | 'taxonomy:manage'
  // Media
  | 'media:view'
  | 'media:upload'
  | 'media:delete'
  // Leads
  | 'leads:view'
  | 'leads:edit'
  | 'leads:delete'
  // Domains
  | 'domains:view'
  | 'domains:create'
  | 'domains:edit'
  | 'domains:delete'
  // Pricing
  | 'pricing:view'
  | 'pricing:edit'
  // Growth & SEO
  | 'growth:view'
  | 'seo:view'
  | 'seo:edit'
  // Tasks
  | 'tasks:view'
  | 'tasks:create'
  | 'tasks:assign'
  | 'tasks:update_own'
  // Users
  | 'users:view'
  | 'users:edit_role'
  | 'users:invite'
  // Settings
  | 'settings:view'
  | 'settings:edit'
  // System
  | 'developer:view';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'sites:view', 'sites:create', 'sites:edit', 'sites:delete',
    'articles:view', 'articles:create', 'articles:edit', 'articles:edit_own', 'articles:publish', 'articles:delete',
    'pages:view', 'pages:create', 'pages:edit', 'pages:publish', 'pages:delete',
    'taxonomy:manage',
    'media:view', 'media:upload', 'media:delete',
    'leads:view', 'leads:edit', 'leads:delete',
    'domains:view', 'domains:create', 'domains:edit', 'domains:delete',
    'pricing:view', 'pricing:edit',
    'growth:view',
    'seo:view', 'seo:edit',
    'tasks:view', 'tasks:create', 'tasks:assign', 'tasks:update_own',
    'users:view', 'users:edit_role', 'users:invite',
    'settings:view', 'settings:edit',
    'developer:view',
  ],

  admin: [
    'sites:view', 'sites:create', 'sites:edit', 'sites:delete',
    'articles:view', 'articles:create', 'articles:edit', 'articles:edit_own', 'articles:publish', 'articles:delete',
    'pages:view', 'pages:create', 'pages:edit', 'pages:publish', 'pages:delete',
    'taxonomy:manage',
    'media:view', 'media:upload', 'media:delete',
    'leads:view', 'leads:edit', 'leads:delete',
    'domains:view', 'domains:create', 'domains:edit', 'domains:delete',
    'pricing:view', 'pricing:edit',
    'growth:view',
    'seo:view', 'seo:edit',
    'tasks:view', 'tasks:create', 'tasks:assign', 'tasks:update_own',
    'users:view', 'users:edit_role', 'users:invite',
    'settings:view', 'settings:edit',
    'developer:view',
  ],

  seo_manager: [
    'sites:view',
    'articles:view', 'articles:create', 'articles:edit', 'articles:edit_own', 'articles:publish',
    'pages:view', 'pages:create', 'pages:edit', 'pages:publish',
    'taxonomy:manage',
    'media:view', 'media:upload',
    'domains:view',
    'pricing:view', 'pricing:edit',
    'growth:view',
    'seo:view', 'seo:edit',
    'tasks:view', 'tasks:create', 'tasks:assign', 'tasks:update_own',
    'users:view',
  ],

  content_editor: [
    'sites:view',
    'articles:view', 'articles:create', 'articles:edit', 'articles:edit_own', 'articles:publish',
    'pages:view', 'pages:create', 'pages:edit', 'pages:publish',
    'taxonomy:manage',
    'media:view', 'media:upload', 'media:delete',
    'pricing:view', 'pricing:edit',
    'growth:view',
    'seo:view',
    'tasks:view', 'tasks:create', 'tasks:assign', 'tasks:update_own',
  ],

  writer: [
    'sites:view',
    'articles:view', 'articles:create', 'articles:edit_own',
    'media:view', 'media:upload',
    'tasks:view', 'tasks:update_own',
    'seo:view',
  ],

  lead_manager: [
    'sites:view',
    'leads:view', 'leads:edit',
    'tasks:view', 'tasks:create', 'tasks:update_own',
  ],

  domain_manager: [
    'sites:view',
    'domains:view', 'domains:create', 'domains:edit',
    'tasks:view', 'tasks:create', 'tasks:update_own',
  ],

  developer: [
    'sites:view',
    'articles:view',
    'pages:view',
    'domains:view',
    'settings:view',
    'developer:view',
    'tasks:view', 'tasks:update_own',
  ],

  viewer: [
    'sites:view',
    'articles:view',
    'pages:view',
    'growth:view',
  ],
};

export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole | null | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Sjekk om rolle skal kunne se en spesifikk navigation route.
 */
export const NAV_PERMISSIONS: Record<string, Permission> = {
  '/dashboard': 'sites:view',
  '/sites': 'sites:view',
  '/articles': 'articles:view',
  '/pages': 'pages:view',
  '/categories': 'taxonomy:manage',
  '/topics': 'taxonomy:manage',
  '/media': 'media:view',
  '/leads': 'leads:view',
  '/domains': 'domains:view',
  '/growth': 'growth:view',
  '/seo': 'seo:view',
  '/pricing': 'pricing:view',
  '/tasks': 'tasks:view',
  '/users': 'users:view',
  '/settings': 'settings:view',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Eier',
  admin: 'Administrator',
  seo_manager: 'SEO Manager',
  content_editor: 'Innholdsredaktør',
  writer: 'Skribent',
  lead_manager: 'Lead Manager',
  domain_manager: 'Domain Manager',
  developer: 'Utvikler',
  viewer: 'Leser',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Full tilgang til alt i systemet',
  admin: 'Kan administrere systemet',
  seo_manager: 'Jobber med SEO, AEO, GEO, LLM og innholdsplan',
  content_editor: 'Redigerer og publiserer innhold',
  writer: 'Lager utkast (kan ikke publisere)',
  lead_manager: 'Følger opp leads',
  domain_manager: 'Styrer domeneporteføljen',
  developer: 'Tekniske innstillinger og deploy',
  viewer: 'Kun lesetilgang',
};
