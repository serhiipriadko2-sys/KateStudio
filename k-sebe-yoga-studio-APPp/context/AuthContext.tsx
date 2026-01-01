import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { retentionService } from '../services/retentionService';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  authStatus: 'anonymous' | 'otp_sent' | 'authenticated';
  requestOtp: (name: string, phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  cancelOtp: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void; // Exposed to allow manual updates without API calls
  authError: string | null;
  authLoading: boolean;
  pendingPhone: string;
  demoLogin: (name: string) => Promise<void>; // Demo mode without Supabase
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthContextType['authStatus']>('anonymous');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingName, setPendingName] = useState('');

  // Check if Supabase is properly configured
  const isSupabaseConfigured =
    !!import.meta.env.VITE_SUPABASE_URL &&
    !!import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      const storedUser = await dataService.getUser();
      if (storedUser && isMounted) {
        setUser(storedUser);
      }
    };
    loadUser();

    // Keep auth status in sync with Supabase session.
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setAuthStatus(data.session ? 'authenticated' : 'anonymous');
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.access_token) {
        setAuthStatus('authenticated');
        const cached = await dataService.getUser();
        const sessionUserId = session.user?.id;
        const phone = session.user?.phone || cached?.phone || pendingPhone;
        const name = cached?.name || pendingName || 'Пользователь';

        if (sessionUserId && phone) {
          if (!cached || cached.id !== sessionUserId) {
            const profile = await dataService.registerUser(name, phone, sessionUserId);
            setUser(profile);
          } else {
            setUser(cached);
          }
        } else if (cached) {
          setUser(cached);
        }

        // Retention bootstrap: migrate local onboarding/streak → Supabase on first login.
        if (session.user?.id) {
          retentionService.bootstrapForUser(session.user.id).catch(() => {});
        }
      } else {
        setAuthStatus('anonymous');
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestOtp = async (name: string, phone: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      setPendingPhone(normalizedPhone);
      setPendingName(name.trim() || 'Пользователь');

      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          // Avoid auto-redirects for OTP.
          shouldCreateUser: true,
        },
      });
      if (error) throw error;

      setAuthStatus('otp_sent');
    } catch (e) {
      console.error('OTP request failed', e);
      if (!isSupabaseConfigured) {
        setAuthError('SMS недоступна в демо-режиме. Используйте кнопку «Войти без SMS».');
      } else {
        setAuthError('Не удалось отправить код. Проверьте номер и попробуйте снова.');
      }
      setAuthStatus('anonymous');
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (!pendingPhone) {
        setAuthError('Сначала запросите код.');
        setAuthStatus('anonymous');
        return;
      }
      const token = code.replace(/\s+/g, '');
      const { data, error } = await supabase.auth.verifyOtp({
        phone: pendingPhone,
        token,
        type: 'sms',
      });
      if (error) throw error;

      // Cache / sync profile for UI
      const supabaseUserId = data.user?.id;
      const profile = await dataService.registerUser(
        pendingName || 'Пользователь',
        pendingPhone,
        supabaseUserId
      );
      setUser(profile);
      setAuthStatus('authenticated');
    } catch (e) {
      console.error('OTP verify failed', e);
      setAuthError('Неверный код или срок действия истёк. Попробуйте ещё раз.');
      setAuthStatus('otp_sent');
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const cancelOtp = () => {
    setAuthError(null);
    setPendingPhone('');
    setPendingName('');
    setAuthStatus('anonymous');
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    dataService.logout();
    setUser(null);
    setPendingPhone('');
    setPendingName('');
    setAuthStatus('anonymous');
  };

  // Demo login without Supabase - creates local-only profile
  const demoLogin = async (name: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const demoId = `demo-${Date.now()}`;
      const profile = await dataService.registerUser(
        name.trim() || 'Гость',
        '+7 000 000-00-00',
        demoId
      );
      setUser(profile);
      setAuthStatus('authenticated');
    } catch (e) {
      console.error('Demo login failed', e);
      setAuthError('Не удалось создать профиль.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authStatus,
        requestOtp,
        verifyOtp,
        cancelOtp,
        logout,
        isAuthenticated: authStatus === 'authenticated' && !!user,
        setUser,
        authError,
        authLoading,
        pendingPhone,
        demoLogin,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
