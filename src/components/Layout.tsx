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
    <div className="min-h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f] text-[#e8e8ec] flex flex-col relative overflow-hidden">
      <div className={`flex-1 flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
}
