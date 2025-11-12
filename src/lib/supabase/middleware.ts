import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/lib/database.types';

export function createClient(request: NextRequest) {
  // Inicializamos una respuesta para devolver desde el middleware
  let response = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value ?? null;
        },
        set(name: string, value: string, options) {
          // Actualizamos la respuesta para que el navegador reciba la cookie
          // Usamos any para evitar incompatibilidades en la firma de tipos
          (response.cookies as any).set(name, value, options);
        },
        remove(name: string, options) {
          // Elimina la cookie en la respuesta
          (response.cookies as any).delete(name, options);
        },
      },
    }
  );

  return { supabase, response };
}