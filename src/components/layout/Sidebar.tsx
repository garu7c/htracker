'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Iconos de lucide-react
import { TrendingUp, Droplets, Utensils, Moon, Dumbbell, LogOut } from 'lucide-react';
import { getTexts } from '@/lib/i18n';

// Definición de los elementos del menú (Ajustado a tu estructura de carpetas)
const sidebarItems = [
  // Usa keys para resolver títulos desde el JSON de textos
  { key: 'stats', href: '/stats', icon: TrendingUp },
  { key: 'exercises', href: '/exercises', icon: Dumbbell },
  { key: 'nutrition', href: '/nutrition', icon: Utensils },
  { key: 'sleep', href: '/sleep', icon: Moon },
  { key: 'hydration', href: '/hydration', icon: Droplets },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = getTexts();

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }
  
  // Función auxiliar para determinar si un enlace está activo
  const isActive = (href: string) => {
    // Para el dashboard principal, la ruta debe ser exacta.
    if (href === '/stats') {
      return pathname === href;
    }
    
    // Para las demás secciones, verifica si la ruta actual comienza con el href.
    // Esto permite que /main/exercises/new sea activo en el botón /main/exercises.
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 border-r fixed h-full bg-white z-10">
      <div className="p-6 border-b">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{t.sidebar.title}</h1>
          <p className="text-sm text-gray-500">{t.sidebar.subtitle}</p>
        </div>
      </div>
      
      <nav className="p-4 space-y-1">
        {sidebarItems.map(({ href, key, icon: Icon }) => (
          <div key={href}>
            <Link
              href={href}
              className={`flex items-center w-full px-3 py-2 rounded-lg text-base transition-colors cursor-pointer ${
                isActive(href)
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              <span>{t.sidebar.items[key]}</span>
            </Link>
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 rounded-lg text-base transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600 cursor-pointer"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>{t.sidebar.logout}</span>
        </button>
      </div>
    </aside>
  );
}