'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TrendingUp, Droplets, Utensils, Moon, Dumbbell, LogOut } from 'lucide-react';
import { getTexts } from '@/lib/i18n';
import Image from 'next/image';

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

  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const collapsedWidth = '5rem';
  const expandedWidth = '13rem';

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
        fixed top-3 left-3 h-[calc(100vh-1.5rem)] z-50
        transition-all duration-300 ease-in-out
        p-3
        bg-white/80 dark:bg-gray-900/80 
        border border-gray-100 dark:border-gray-800
        rounded-xl shadow-xl backdrop-blur-md
      `}
      style={{ width: finalWidth }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col justify-between h-168">
        
        {/* Encabezado con logo - tamaño consistente */}
        <div className="flex items-center justify-center h-12 pb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title={isExpanded ? 'Colapsar' : 'Expandir'}
          >
            <div className="h-8 w-8 relative">
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
        <nav className="flex-grow space-y-2 overflow-y-auto">
          {sidebarItems.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 
                ${isActive(href)
                  ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100'
                  : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                }
              `}
            >
              {/* Iconos con tamaño consistente: h-6 w-6 en ambos estados */}
              <Icon className={`h-6 w-6 ${isMinimal ? 'mx-auto' : 'mr-3'}`} />
              <span 
                className={`transition-opacity duration-300 whitespace-nowrap overflow-hidden font-medium ${isMinimal ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}
              >
                {t.sidebar.items[key]}
              </span>
            </Link>
          ))}
        </nav>

        {/* Logout - icono con tamaño consistente en ambos estados */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200
              font-medium
              text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer
            `}
          >
            {/* Icono de logout con tamaño consistente: h-6 w-6 en ambos estados */}
            <LogOut className={`h-6 w-6 ${isMinimal ? 'mx-auto' : 'mr-3'}`} />
            <span
              className={`transition-opacity duration-300 whitespace-nowrap overflow-hidden ${isMinimal ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}
            >
              {t.sidebar.logout}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}