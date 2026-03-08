import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars are missing, export null — AppContext handles fallback
export const supabase = (supabaseUrl && supabaseAnon)
  ? createClient(supabaseUrl, supabaseAnon, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export const SUPABASE_ENABLED = !!(supabaseUrl && supabaseAnon);
