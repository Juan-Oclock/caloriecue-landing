import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token_hash, type } = body;

    console.log('[verify] Received request:', { token_hash: token_hash?.substring(0, 10) + '...', type });
    console.log('[verify] SUPABASE_URL set:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[verify] ANON_KEY set:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (!token_hash || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters', debug: { hasTokenHash: !!token_hash, hasType: !!type } },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    console.log('[verify] Supabase client created, calling verifyOtp...');

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    console.log('[verify] verifyOtp result:', { hasData: !!data, hasError: !!error, errorMessage: error?.message });

    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.status },
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
