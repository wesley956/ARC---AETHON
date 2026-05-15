// ============================================================
// ARC: AETHON — FLOATING NOTIFICATION
// Shows temporary feedback messages.
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
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        max-w-[90%] w-auto px-4 py-3
        ${bgColor} border rounded-lg
        shadow-lg backdrop-blur-sm
        transition-all duration-300
        ${isLeaving ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}
        animate-notification
      `}
    >
      <p className="text-sm text-white text-center leading-relaxed">
        {message}
      </p>
    </div>
  );
}
