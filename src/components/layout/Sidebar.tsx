'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TrendingUp, Droplets, Utensils, Moon, Dumbbell, LogOut, Sun } from 'lucide-react';
import { getTexts } from '@/lib/i18n';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

const sidebarItems = [
  { key: 'stats', href: '/stats', icon: TrendingUp },
  { key: 'exercises', href: '/exercises', icon: Dumbbell },
  { key: 'nutrition', href: '/nutrition', icon: Utensils },
  { key: 'sleep', href: '/sleep', icon: Moon },
  { key: 'hydration', href: '/hydration', icon: Droplets },
];

interface SidebarProps {
  onWidthChange?: (width: string) => void;
}

export default function Sidebar({ onWidthChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = getTexts();
  const { theme, toggleTheme } = useTheme();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const collapsedWidth = '6rem';
  const expandedWidth = '16rem';

  const finalWidth = isExpanded || isHovered ? expandedWidth : collapsedWidth;

  // Notificar cambios de ancho al layout padre
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(finalWidth);
    }
  }, [finalWidth, onWidthChange]);

  const isMinimal = !isExpanded && !isHovered;

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed top-4 left-4 h-[calc(100vh-2rem)] z-50
        transition-all duration-300 ease-in-out
        p-4
        bg-white/80 dark:bg-gray-900/80
        border border-gray-100 dark:border-gray-800
        rounded-2xl shadow-xl backdrop-blur-md
      `}
      style={{ width: finalWidth }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col justify-between h-full">

        {/* Encabezado con logo - tamaño consistente */}
        <div className="flex items-center justify-center h-16 pb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            <div className="h-10 w-10 relative">
              <Image
                src="/logo.png"
                alt="HTracker Logo"
                fill
                className="object-contain"
              />
            </div>
          </button>
        </div>

        {/* Navegación - iconos con tamaño consistente en ambos estados */}
        <nav className="flex-grow space-y-3 overflow-y-auto">
          {sidebarItems.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center w-full px-4 py-4 rounded-xl transition-all duration-200
                ${isActive(href)
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'
                }
              `}
            >
              {/* Iconos con tamaño consistente: h-7 w-7 en ambos estados */}
              <Icon className={`h-7 w-7 ${isMinimal ? 'mx-auto' : 'mr-4'}`} />
              <span
                className={`transition-opacity duration-300 whitespace-nowrap overflow-hidden font-medium ${isMinimal ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}
              >
                {t.sidebar.items[key]}
              </span>
            </Link>
          ))}
        </nav>

        {/* Botón de modo oscuro FUNCIONAL + Logout */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            className={`
              flex items-center w-full px-4 py-4 rounded-xl transition-all duration-200 
              text-gray-700 dark:text-gray-300 
              hover:bg-gray-100 dark:hover:bg-gray-800 
              border border-transparent
            `}
          >
            {/* Icono dinámico según el tema */}
            {theme === 'light' ? (
              <Moon className={`h-7 w-7 ${isMinimal ? 'mx-auto' : 'mr-4'}`} />
            ) : (
              <Sun className={`h-7 w-7 ${isMinimal ? 'mx-auto' : 'mr-4'}`} />
            )}
            <span className={`cursor-pointer transition-opacity duration-300 whitespace-nowrap overflow-hidden ${isMinimal ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
              {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
          </button>

          {/* Logout - icono con tamaño consistente en ambos estados */}
          <div className="mt-2">
            <button
              onClick={handleLogout}
              className={`
                flex items-center w-full px-4 py-4 rounded-xl transition-all duration-200
                font-medium
                text-red-600 dark:text-red-400 
                hover:bg-red-50 dark:hover:bg-red-900/30 
                border border-transparent hover:border-red-100 dark:hover:border-red-800
              `}
            >
              {/* Icono de logout con tamaño consistente: h-7 w-7 en ambos estados */}
              <LogOut className={`h-7 w-7 ${isMinimal ? 'mx-auto' : 'mr-4'}`} />
              <span
                className={` cursor-pointer transition-opacity duration-300 whitespace-nowrap overflow-hidden ${isMinimal ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}
              >
                {t.sidebar.logout}
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}