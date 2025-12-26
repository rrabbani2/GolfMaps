import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in server components and route handlers.
 * This client uses Next.js cookies() for authentication, enabling proper SSR.
 * 
 * Usage in route handlers:
 * ```ts
 * const supabase = await createClient();
 * const { data } = await supabase.from('table').select();
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name);
          return cookie ? cookie.value : null;
        },
        set(name: string, value: string, options?: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options?: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, '', { ...options, maxAge: -1 });
        },
      },
    }
  )
}

/**
 * Creates a Supabase client with service role key (bypasses RLS).
 * Use only for admin operations that need to bypass Row Level Security.
 * 
 * WARNING: Never expose the service role key to the client!
 * This should only be used in server-side code.
 */
export async function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service role key. SUPABASE_SERVICE_ROLE_KEY is required for admin operations.');
  }

  // For service role, we use the regular supabase-js client
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
