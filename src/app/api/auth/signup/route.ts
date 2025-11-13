import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json();

    // Validar que los campos requeridos estén presentes
    if (!email || !password || !username) {
      return NextResponse.json(
        { ok: false, error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    // Llamar a Supabase para crear el usuario
    // Support both NEXT_PUBLIC_* (client) and server env vars as fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { ok: false, error: 'Supabase configuration is missing' },
        { status: 500 }
      );
    }

    // Usar el endpoint de signup de Supabase
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: {
          username,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log Supabase response to server console for easier debugging
      console.error('Supabase signup failed:', response.status, data);
      // Retornar error de Supabase con el estado HTTP correspondiente
      return NextResponse.json(
        { ok: false, error: data.error_description || data.message || 'Signup failed' },
        { status: response.status }
      );
    }

    // Si el signup fue exitoso, retornar los datos del usuario
    return NextResponse.json(
      { ok: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
