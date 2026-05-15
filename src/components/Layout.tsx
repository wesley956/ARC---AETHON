// ============================================================
// ARC: AETHON — LAYOUT
// Mobile-first container for all screens.
// ============================================================

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div 
      className={`
        min-h-screen min-h-[100dvh] w-full max-w-md mx-auto 
        flex flex-col bg-[#0a0a12] 
        overflow-x-hidden
        safe-area-bottom
        ${className}
      `}
    >
      {children}
    </div>
  );
}
