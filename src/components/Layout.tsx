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
        min-h-dvh w-full max-w-md mx-auto
        flex flex-col
        bg-aethon-bg
        relative overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
}
