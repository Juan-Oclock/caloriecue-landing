import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { token_hash, type } = await request.json();

  if (!token_hash || !type) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
