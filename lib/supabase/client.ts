'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in client components.
 * This client uses browser cookies for authentication and is safe to use in React components.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

