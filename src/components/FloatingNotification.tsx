// ============================================================
// ARC: AETHON — FLOATING NOTIFICATION
// Simple notification system for EggScreen feedback.
// ============================================================

import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  message: string;
}

interface FloatingNotificationProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function FloatingNotification({ notifications, onDismiss }: FloatingNotificationProps) {
  return (
    <div className="fixed top-4 left-0 right-0 z-40 flex flex-col items-center gap-2 pointer-events-none px-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    // Start exit after 2.5s
    const exitTimer = setTimeout(() => {
      setIsLeaving(true);
    }, 2500);

    // Remove after 3s
    const removeTimer = setTimeout(() => {
      onDismiss(notification.id);
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [notification.id, onDismiss]);

  return (
    <div
      className={`
        max-w-xs w-full px-4 py-3 rounded-xl
        bg-aethon-card/95 backdrop-blur-sm
        border border-aethon-border/60
        shadow-lg shadow-black/30
        text-sm text-aethon-text text-center
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      {notification.message}
    </div>
  );
}

// Hook to manage notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setNotifications((prev) => [...prev, { id, message }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    showNotification,
    dismissNotification,
  };
}
