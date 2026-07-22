/**
 * Whether Supabase credentials are present. When false (e.g. a fresh clone
 * before the client fills in `.env.local`), services fall back to demo data so
 * the template runs and the admin UI is explorable out of the box.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
