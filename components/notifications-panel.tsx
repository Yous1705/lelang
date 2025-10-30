"use client";

import { useEffect, useState } from "react";
import type { Notification } from "@/lib/types";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[Dev] Error fetching notifications:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: number) {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notificationId }),
      });
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[Dev] Error marking notification as read:", error);
      }
    }
  }

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-start md:justify-end z-50">
      <div className="bg-white w-full md:w-96 h-screen md:h-auto md:max-h-96 rounded-t-lg md:rounded-b-lg shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            Notifications{" "}
            {unreadCount > 0 && (
              <span className="text-sm text-primary">({unreadCount})</span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground-secondary hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-foreground-secondary">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-foreground-secondary">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-surface transition ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() =>
                    !notification.read && markAsRead(notification.id)
                  }
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-foreground-secondary mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-foreground-secondary mt-2">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
