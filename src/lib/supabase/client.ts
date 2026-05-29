import { createBrowserClient } from "@supabase/ssr"

// Wrapped so `ReturnType` captures the precise inferred client type
// (annotating with `ReturnType<typeof createBrowserClient>` directly would
// collapse the generics to `any` and break query type inference).
function makeClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Memoized singleton — creating a browser client per render spins up a new
// auth instance and realtime socket each time. We want exactly one per tab.
let client: ReturnType<typeof makeClient> | undefined

export function createClient() {
  if (!client) client = makeClient()
  return client
}
