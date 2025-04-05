import { createClient } from 'jsr:@supabase/supabase-js'

// Create and export a base Supabase client
export const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);