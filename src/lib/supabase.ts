import { createBrowserClient } from '@supabase/ssr';

// Browser client singleton for backward compatibility (WaitlistForm, etc.)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
