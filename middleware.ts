import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

// Rutas clave de tu aplicación
// Note: Next.js App Router route groups like `(main)` are NOT part of the public URL.
// Protect the real public paths instead (without the grouping folder names).
const PROTECTED_PATH_PREFIXES = ['/stats', '/exercises', '/nutrition', '/sleep', '/hydration'];
const AUTH_REDIRECT_PATH = '/login'; // La ruta de tu login (App Router route group `(auth)` maps to `/login`)
const HOME_REDIRECT_PATH = '/stats'; // La ruta de tu dashboard

export async function middleware(request: NextRequest) {
  try {
    // Crear el cliente que manejará la sesión y las cookies
    const { supabase, response } = createClient(request);

    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const pathname = request.nextUrl.pathname;
    const isProtected = PROTECTED_PATH_PREFIXES.some((p) => pathname.startsWith(p));
    const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isHome = pathname === '/';
    
    // --- Lógica de Redirección ---

    if (isHome) {
      // Si accede a la raíz y no está autenticado, va al login
      if (!session) {
        const redirectUrl = new URL(AUTH_REDIRECT_PATH, request.url);
        return NextResponse.redirect(redirectUrl);
      }
      // Si está autenticado, va al dashboard
      const redirectUrl = new URL(HOME_REDIRECT_PATH, request.url);
      return NextResponse.redirect(redirectUrl);
    } else if (isProtected) {
      // 1. Si está intentando acceder a una ruta PROTEGIDA (/main/...)
      if (!session) {
        // No hay sesión -> Redirige al login
        const redirectUrl = new URL(AUTH_REDIRECT_PATH, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } else if (isAuthPath) {
      // 2. Si ya tiene sesión e intenta acceder a LOGIN o REGISTRO (/auth/...)
      if (session) {
        // Hay sesión -> Redirige al dashboard principal
        const redirectUrl = new URL(HOME_REDIRECT_PATH, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // 3. Continuar
    // Si la sesión es válida o está en una ruta no protegida, devuelve la respuesta con las cookies.
    return response;

  } catch (e) {
    // Manejo de errores de Supabase o cookies
    console.error("Middleware Supabase Error:", e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

// Configuración de rutas para que el middleware se ejecute
export const config = {
  matcher: [
    /* Ejecutar el middleware en:
     * - Todas las peticiones a la aplicación.
     * Ignorar:
     * - Archivos estáticos (_next/static, _next/image, favicon.ico)
     * - La carpeta pública (archivos en /public)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};