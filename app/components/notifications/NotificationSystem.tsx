'use client';

import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'security' | 'performance' | 'user' | 'maintenance';
  read: boolean;
  actionRequired?: boolean;
  autoHide?: boolean;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Play notification sound if enabled
      if (soundEnabled && notification.priority !== 'low') {
        playNotificationSound(notification.type);
      }

      // Auto-hide low priority notifications
      if (notification.autoHide !== false && notification.priority === 'low') {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
        }, 5000);
      }
    },
    [soundEnabled],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Notification sound
function playNotificationSound(type: Notification['type']) {
  // Create audio context and play different tones for different notification types
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Different frequencies for different notification types
  const frequencies = {
    success: 800,
    warning: 600,
    error: 400,
    info: 1000,
  };

  oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// Notification Bell Component
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

          {/* Notification Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 z-50">
            <GlassCard className="p-0 max-h-96 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Notifications ({notifications.length})
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-violet-600 hover:text-violet-700"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto">
                {recentNotifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  recentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClose={() => setShowDropdown(false)}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-center text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  View all notifications
                </button>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

// Individual Notification Item
function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const { markAsRead, removeNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(true);

  const handleMarkAsRead = () => {
    markAsRead(notification.id);
  };

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div
      className={`p-4 border-b border-slate-100 dark:border-slate-800 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      } ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''} ${getPriorityColor()}`}
      style={{ borderLeftWidth: '3px' }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                {notification.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {notification.message}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-500">
                  {notification.timestamp.toLocaleTimeString()}
                </span>

                {notification.category && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {notification.category}
                  </span>
                )}

                {notification.actionRequired && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    Action Required
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!notification.read && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                  title="Mark as read"
                >
                  <Eye className="h-3 w-3" />
                </button>
              )}

              <button
                onClick={handleRemove}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                title="Remove notification"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Notification Component
export function NotificationToast({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.autoHide !== false) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.autoHide, onClose]);

  const getToastStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getToastStyles()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {notification.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
          {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
          {notification.type === 'info' && <Info className="h-5 w-5" />}
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-sm mt-1 opacity-90">{notification.message}</p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs opacity-75">
              {notification.timestamp.toLocaleTimeString()}
            </span>

            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-xs opacity-75 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for showing notifications
export function useNotification() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({
        type: 'success',
        title,
        message,
        priority: 'medium',
        category: 'system',
        ...options,
      }),

    warning: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({
        type: 'warning',
        title,
        message,
        priority: 'medium',
        category: 'system',
        ...options,
      }),

    error: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({
        type: 'error',
        title,
        message,
        priority: 'high',
        category: 'system',
        ...options,
      }),

    info: (title: string, message: string, options?: Partial<Notification>) =>
      addNotification({
        type: 'info',
        title,
        message,
        priority: 'low',
        category: 'system',
        ...options,
      }),
  };
}

// Notification Settings
export function NotificationSettings() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showPreviews, setShowPreviews] = useState(true);
  const [autoHide, setAutoHide] = useState(true);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Notification Settings
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Sound Notifications</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Play sound for important notifications
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              soundEnabled ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Show Previews</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Show notification previews in the bell icon
            </p>
          </div>
          <button
            onClick={() => setShowPreviews(!showPreviews)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showPreviews ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showPreviews ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Auto-hide</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Automatically hide low-priority notifications
            </p>
          </div>
          <button
            onClick={() => setAutoHide(!autoHide)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoHide ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoHide ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
