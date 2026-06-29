import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  // eslint-disable-next-line no-var
  var __supabaseAnon: SupabaseClient | undefined;
  // eslint-disable-next-line no-var
  var __supabaseAdmin: SupabaseClient | undefined;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!globalThis.__supabaseAnon) {
    globalThis.__supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  }
  return globalThis.__supabaseAnon;
}

function getServiceClient(): SupabaseClient {
  if (!supabaseUrl) {
    throw new Error('Supabase credentials missing: set NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set — using anon key. Storage RLS policies may block uploads.');
    return getClient();
  }
  if (!globalThis.__supabaseAdmin) {
    globalThis.__supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return globalThis.__supabaseAdmin;
}

export function getSupabase(): SupabaseClient {
  return getClient();
}

export function getSupabaseAdmin(): SupabaseClient {
  return getServiceClient();
}
