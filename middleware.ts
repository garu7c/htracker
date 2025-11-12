import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

// Rutas clave de tu aplicación
const PROTECTED_PATH_PREFIX = '/main'; // Protege todo lo que empiece con /main (ej: /main/stats, /main/exercises)
const AUTH_REDIRECT_PATH = '/auth/login'; // La ruta de tu login
const HOME_REDIRECT_PATH = '/main/stats'; // La ruta de tu dashboard

export async function middleware(request: NextRequest) {
  try {
    // Crear el cliente que manejará la sesión y las cookies
    const { supabase, response } = createClient(request);

    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const pathname = request.nextUrl.pathname;
    const isProtected = pathname.startsWith(PROTECTED_PATH_PREFIX);
    const isAuthPath = pathname.startsWith('/auth/');
    
    // --- Lógica de Redirección ---

    if (isProtected) {
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
    // Si la sesión es válida o está en una ruta no protegida (como '/'), devuelve la respuesta con las cookies.
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