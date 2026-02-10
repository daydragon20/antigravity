import { useState, useEffect, useCallback } from 'react';

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  mealReminders: boolean;
  movementReminders: boolean;
  restReminders: boolean;
  energyCheckIns: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  taskReminders: true,
  mealReminders: true,
  movementReminders: true,
  restReminders: true,
  energyCheckIns: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notification-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      setSettings(prev => ({ ...prev, enabled: true }));
      // Show a test notification
      new Notification('EnergiePlanner', {
        body: 'Notificaties zijn nu ingeschakeld! 🎉',
        icon: '/favicon.ico',
      });
      return true;
    }
    return false;
  }, []);

  const sendNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (!settings.enabled || permission !== 'granted') return;

    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }, [settings.enabled, settings.vibrationEnabled, permission]);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    permission,
    settings,
    requestPermission,
    sendNotification,
    updateSettings,
    isSupported: 'Notification' in window,
  };
}
