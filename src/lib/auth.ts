import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasPermission, type Permission } from '@/lib/permissions';
import type { Profile } from '@/types/database';

/**
 * Hent innlogget bruker + profil i en Server Component eller Action.
 * Returnerer null hvis ikke innlogget.
 */
export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
  profile: Profile;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) return null;
  if (!profile.is_active) return null;

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile,
  };
}

/**
 * Krev innlogget bruker. Redirect til /login hvis ikke.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Krev en spesifikk tillatelse. Redirect til /dashboard hvis bruker
 * mangler tilgang.
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  if (!hasPermission(user.profile.role, permission)) {
    redirect('/dashboard?error=forbidden');
  }
  return user;
}

/**
 * Krev en av flere tillatelser.
 */
export async function requireAnyPermission(permissions: Permission[]) {
  const user = await requireAuth();
  const hasAny = permissions.some((p) => hasPermission(user.profile.role, p));
  if (!hasAny) {
    redirect('/dashboard?error=forbidden');
  }
  return user;
}
