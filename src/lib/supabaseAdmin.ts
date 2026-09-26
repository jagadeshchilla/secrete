import { createClient } from "@supabase/supabase-js";

// Server-only client — uses the service role key, which must never reach the
// browser. Only import this from Route Handlers / server code.
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdmin() {
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set in .env.local");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
