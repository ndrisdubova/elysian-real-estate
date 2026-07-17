// The Supabase client is created lazily via a dynamic import so the heavy
// @supabase/supabase-js bundle (~55KB gzip) is fetched on first use — after
// the homepage has painted — instead of being pulled into the initial
// critical bundle. Every consumer awaits getSupabase(); the underlying client
// is a singleton, created once and reused.
let clientPromise;

export function getSupabase() {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
      )
    );
  }
  return clientPromise;
}
