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
    <div className={`min-h-screen-safe flex flex-col container-mobile ${className}`}>
      {children}
    </div>
  );
}
