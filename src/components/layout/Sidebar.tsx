'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Iconos de lucide-react
import { TrendingUp, Droplets, Utensils, Moon, Dumbbell } from 'lucide-react';

// Definición de los elementos del menú (Ajustado a tu estructura de carpetas)
const sidebarItems = [
  // Dashboard principal es ahora /main/stats
  { href: '/stats', title: 'Datos y Análisis', icon: TrendingUp },
  { href: '/exercises', title: 'Ejercicio', icon: Dumbbell },
  { href: '/nutrition', title: 'Alimentación', icon: Utensils },
  { href: '/sleep', title: 'Sueño', icon: Moon },
  { href: '/hydration', title: 'Hidratación', icon: Droplets },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  // Función auxiliar para determinar si un enlace está activo
  const isActive = (href: string) => {
    // Para el dashboard principal, la ruta debe ser exacta.
    if (href === '/main/stats') {
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
          <h1 className="text-xl font-semibold">Tracker de Hábitos</h1>
          <p className="text-sm text-gray-500">Vida saludable</p>
        </div>
      </div>
      
      <nav className="p-4 space-y-1">
        {sidebarItems.map(({ href, title, icon: Icon }) => (
          <div key={href}>
            <Link
              href={href}
              className={`flex items-center w-full px-3 py-2 rounded-lg text-base transition-colors ${
                isActive(href)
                  ? 'bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              <span>{title}</span>
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
}