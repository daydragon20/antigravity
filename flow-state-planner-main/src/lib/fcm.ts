// Firebase Cloud Messaging setup
// Requires these env vars to be set:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
// VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_FIREBASE_VAPID_KEY

import { supabase } from '@/integrations/supabase/client';

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const isFCMConfigured = !!(
  FIREBASE_CONFIG.apiKey &&
  FIREBASE_CONFIG.projectId &&
  VAPID_KEY
);

let messaging: any = null;

export async function initFCM(): Promise<boolean> {
  if (!isFCMConfigured) return false;

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging');

    const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
    messaging = getMessaging(app);

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      if (payload.notification) {
        new Notification(payload.notification.title || 'Flow State', {
          body: payload.notification.body,
          icon: '/favicon.ico',
        });
      }
    });

    return true;
  } catch (error) {
    console.warn('FCM initialization failed:', error);
    return false;
  }
}

export async function requestFCMToken(userId: string): Promise<string | null> {
  if (!messaging || !VAPID_KEY) return null;

  try {
    const { getToken } = await import('firebase/messaging');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });

    // Save to Supabase
    await supabase.from('push_tokens').upsert({ user_id: userId, token, platform: 'web' }, { onConflict: 'token' });

    return token;
  } catch (error) {
    console.warn('Failed to get FCM token:', error);
    return null;
  }
}
