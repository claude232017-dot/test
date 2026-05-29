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

// Cached id of the signed-in user. Every table's `user_id` column is
// `not null` and guarded by an RLS policy (`auth.uid() = user_id`), so every
// insert must carry the user's id. We resolve it once and reuse it; a stale or
// forged value can never get past RLS, which validates server-side.
let cachedUserId: string | null = null

export async function getCurrentUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId
  const { data: { user } } = await createClient().auth.getUser()
  cachedUserId = user?.id ?? null
  return cachedUserId
}
