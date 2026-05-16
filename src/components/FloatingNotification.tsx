// ============================================================
// ARC: AETHON — FLOATING NOTIFICATION
// ============================================================

import { useEffect, useState } from 'react';

interface FloatingNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function FloatingNotification({ message, type = 'info', duration = 3000, onClose }: FloatingNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => { setIsVisible(false); onClose?.(); }, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-900/95 border-green-700/50',
    error: 'bg-red-900/95 border-red-700/50',
    info: 'bg-purple-900/95 border-purple-700/50',
  }[type];

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl border ${bgColor} text-sm text-white animate-slide-down safe-area-top ${isLeaving ? 'animate-slide-up' : ''}`}>
      {message}
    </div>
  );
}
