import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Kjør for alle paths unntatt:
     * - _next/static (statiske filer)
     * - _next/image (bildeoptimalisering)
     * - favicon.ico
     * - alle filer med extension (.svg, .png osv)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
