import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxhgpvkkeyguovvyqsft.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aGdwdmtrZXlndW92dnlxc2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MzM1OTUsImV4cCI6MjA4MjAwOTU5NX0.U2s9NxGHboptK6dUFAv9HXyaVk-WICTIiDKiV9TIS7E';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token_hash, type } = body;

    if (!token_hash || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Route Handler context, safe to ignore
          }
        },
      },
    });

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[verify] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Server error', debug: String(err) },
      { status: 500 }
    );
  }
}
