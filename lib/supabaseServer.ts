import { createClient } from '@supabase/supabase-js';

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  // Use service role key for server-side API routes to bypass RLS
  // This is safe for server-side operations and ensures we can read public data
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseKey = serviceRoleKey || anonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  if (serviceRoleKey) {
    console.log('[Supabase Server] Using service role key (bypasses RLS)');
  } else {
    console.log('[Supabase Server] Using anon key (RLS policies apply)');
    console.warn('[Supabase Server] Consider adding SUPABASE_SERVICE_ROLE_KEY to .env.local for server-side operations');
  }

  // Prefer service role key (bypasses RLS) for server-side operations
  // Falls back to anon key if service role key is not available
  return createClient(supabaseUrl, supabaseKey);
}

