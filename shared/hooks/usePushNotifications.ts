/**
 * usePushNotifications — Web Push / FCM registration hook
 *
 * Requests notification permission, registers the service worker,
 * obtains an FCM token via the Web Push API, and saves it to Supabase.
 *
 * Required env vars (client-side):
 *   VITE_FIREBASE_VAPID_KEY      — Web Push VAPID key from Firebase Console
 *   VITE_FIREBASE_API_KEY        — Firebase web config
 *   VITE_FIREBASE_PROJECT_ID     — Firebase project ID
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *
 * Usage:
 *   const { permission, isSubscribed, subscribe, unsubscribe } = usePushNotifications(user?.id);
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';

export type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

export interface UsePushNotificationsReturn {
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

function isSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

async function getFirebaseToken(config: FirebaseConfig): Promise<string | null> {
  // Lazily import firebase/messaging to avoid bundle bloat for users who don't subscribe
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getMessaging, getToken } = await import('firebase/messaging');

    const app =
      getApps().length === 0
        ? initializeApp({
            apiKey: config.apiKey,
            projectId: config.projectId,
            messagingSenderId: config.messagingSenderId,
            appId: config.appId,
          })
        : getApps()[0];

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: config.vapidKey });
    return token ?? null;
  } catch (err) {
    console.error('usePushNotifications: Firebase error', err);
    return null;
  }
}

async function saveTokenToSupabase(userId: string, token: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('user_push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: 'web',
      user_agent: navigator.userAgent.slice(0, 255),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,token', ignoreDuplicates: false }
  );
}

async function deleteTokenFromSupabase(userId: string, token: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('user_push_tokens').delete().eq('user_id', userId).eq('token', token);
}

const LOCAL_KEY = 'ksebe_fcm_token';

export function usePushNotifications(
  userId?: string,
  firebaseConfig?: FirebaseConfig
): UsePushNotificationsReturn {
  const supported = isSupported();

  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? (Notification.permission as NotificationPermission) : 'unsupported'
  );
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return !!localStorage.getItem(LOCAL_KEY);
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync permission state if it changes externally
  useEffect(() => {
    if (!supported) return;
    setPermission(Notification.permission as NotificationPermission);
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported || !userId || !firebaseConfig) return;
    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      if (result !== 'granted') return;

      if (!firebaseConfig) {
        console.warn('usePushNotifications: firebaseConfig not provided');
        return;
      }
      const token = await getFirebaseToken(firebaseConfig);
      if (!token) return;

      localStorage.setItem(LOCAL_KEY, token);
      await saveTokenToSupabase(userId, token);
      setIsSubscribed(true);
    } catch (err) {
      console.error('usePushNotifications: subscribe error', err);
    } finally {
      setIsLoading(false);
    }
  }, [supported, userId, firebaseConfig]);

  const unsubscribe = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem(LOCAL_KEY);
      if (token) {
        await deleteTokenFromSupabase(userId, token);
        localStorage.removeItem(LOCAL_KEY);
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('usePushNotifications: unsubscribe error', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
