import { createClient } from 'jsr:@supabase/supabase-js'
import "https://deno.land/std@0.224.0/dotenv/load.ts";

// Create and export a base Supabase client
export const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);