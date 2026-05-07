import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Service-role klient. Bypasser RLS.
 *
 * KUN for:
 *  - Bakgrunnsjobber
 *  - Webhooks
 *  - Public lead-skjema endpoints (validert serverless API)
 *  - Sitemap/robots/llms.txt generering
 *
 * Bruk ALDRI denne i Server Components knyttet til en innlogget bruker.
 * Bruk createClient() fra ./server.ts der i stedet.
 *
 * 'server-only' importen kaster build-error hvis denne filen
 * blir importert i en client component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY mangler. Service role kan KUN brukes server-side.'
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
