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

export default function FloatingNotification({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: FloatingNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-900/90 border-green-700',
    error: 'bg-red-900/90 border-red-700',
    info: 'bg-purple-900/90 border-purple-700',
  }[type];

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]
        px-4 py-3 rounded-xl border shadow-lg
        ${bgColor}
        ${isLeaving ? 'animate-slide-up' : 'animate-slide-down'}
      `}
    >
      <p className="text-sm text-white text-center">{message}</p>
    </div>
  );
}
