import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    return getClient();
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export function getSupabase() {
  return getClient();
}

export function getSupabaseAdmin() {
  return getServiceClient();
}
