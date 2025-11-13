import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Use the server Supabase client which will manage cookies via the
    // cookie helpers configured in `createServerSupabaseClient`.
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message || 'Invalid credentials' }, { status: 401 });
    }

    // On success, the Supabase SSR client should have queued cookies to be
    // set on the response. Return success to the client so it can redirect.
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
