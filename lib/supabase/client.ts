import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

/**
 * We lazily create the browser Supabase client only when the public
 * env-vars are present.
 * In the v0 preview sandbox those vars are usually missing, so we fall
 * back to a dummy client that throws on use instead of crashing during
 * import time.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createDummyClient(): SupabaseClient<Database> {
  const handler = {
    get() {
      throw new Error(
        "Supabase client not initialised – missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      )
    },
  }
  return new Proxy({}, handler) as unknown as SupabaseClient<Database>
}

export const supabase: SupabaseClient<Database> =
  supabaseUrl && supabaseAnonKey ? createClient<Database>(supabaseUrl, supabaseAnonKey) : createDummyClient()
