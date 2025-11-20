'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useState } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState('6rem'); // Actualizado a 6rem

  return (
    <div className="flex min-h-screen bg-blue-100/50">
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ width: sidebarWidth }}
      >
        <Sidebar onWidthChange={setSidebarWidth} />
      </div>
      <main 
        className="flex-1 transition-all duration-300 ease-in-out p-6"
        style={{ 
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`
        }}
      >
        <div className="w-full mx-auto pr-12">
          {children}
        </div>
      </main>
    </div>
  );
}