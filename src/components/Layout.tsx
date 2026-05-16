// ============================================================
// ARC: AETHON — LAYOUT
// ============================================================

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`min-h-screen-safe flex flex-col items-center bg-[#0a0a12] ${className}`}>
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col safe-area-bottom">
        {children}
      </main>
    </div>
  );
}
