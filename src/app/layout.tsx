import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/sonner';
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Allive",
  description: "Dashboard de seguimiento de hábitos",
  icons: {
    icon: '/ptm.svg',
  },
};

// Función para verificar autenticación
async function isAuthenticated() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session-token'); // Ajusta según tu implementación
  return !!sessionToken;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authenticated = await isAuthenticated();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Solo mostrar el layout de la app si está autenticado */}
        {authenticated ? (
          <div className="min-h-screen bg-blue-50/40">
            {/* Sidebar principal */}
            <Sidebar />

            {/* Contenido Principal */}
            <main className="min-h-screen pl-6 pt-6 pr-6 pb-6">
              {children}
            </main>
          </div>
        ) : (
          // Si no está autenticado, mostrar solo el contenido sin sidebar
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        )}

        <Toaster />
      </body>
    </html>
  );
}