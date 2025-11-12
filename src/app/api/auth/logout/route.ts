import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response that clears any auth-related cookies
    const response = NextResponse.json({ ok: true }, { status: 200 });
    
    // Clear auth token cookies (if you're using them in the future)
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');
    
    return response;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Logout error' }, { status: 500 });
  }
}
