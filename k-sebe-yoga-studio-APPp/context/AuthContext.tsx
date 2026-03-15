import { isSupabaseConfigured, supabase } from '@ksebe/shared';
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { retentionService } from '../services/retentionService';
import { UserProfile } from '../types';

export type AuthMethod = 'email' | 'phone';

interface AuthContextType {
  user: UserProfile | null;
  authStatus: 'anonymous' | 'phone_otp_sent' | 'email_unverified' | 'authenticated';
  signUp: (name: string, identifier: string, password: string, method: AuthMethod) => Promise<void>;
  signIn: (identifier: string, password: string, method: AuthMethod) => Promise<void>;
  verifyPhoneRegistration: (code: string) => Promise<void>;
  cancelPhoneVerification: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setUser: (user: UserProfile) => void;
  authError: string | null;
  authLoading: boolean;
  pendingPhone: string;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthContextType['authStatus']>('anonymous');
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

  // Refs to avoid stale closure in onAuthStateChange
  const pendingPhoneRef = useRef('');
  const pendingNameRef = useRef('');

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const storedUser = await dataService.getUser();
      if (storedUser && isMounted) {
        setUser(storedUser);
      }
    };
    loadUser();

    if (!isSupabaseConfigured) {
      setAuthStatus('anonymous');
      setIsInitializing(false);
      return () => {
        isMounted = false;
      };
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setAuthStatus(data.session ? 'authenticated' : 'anonymous');
      setIsInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.access_token) {
        setAuthStatus('authenticated');
        const sessionUserId = session.user?.id;
        if (sessionUserId) {
          const identifier = session.user?.phone || session.user?.email || '';
          const name =
            (session.user?.user_metadata as Record<string, string> | undefined)?.name ||
            pendingNameRef.current ||
            'Пользователь';
          const profile = await dataService.registerUser(name, identifier, sessionUserId);
          if (isMounted) setUser(profile);
          retentionService.bootstrapForUser(sessionUserId).catch(() => {});
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthStatus('anonymous');
      }
      // Other events without session (SIGNED_UP pending confirmation) — don't touch authStatus
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (name: string, identifier: string, password: string, method: AuthMethod) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (!isSupabaseConfigured) throw new Error('CONFIG_MISSING');

      const trimmedName = name.trim() || 'Пользователь';
      pendingNameRef.current = trimmedName;

      if (method === 'email') {
        const { error } = await supabase.auth.signUp({
          email: identifier.trim(),
          password,
          options: { data: { name: trimmedName } },
        });
        if (error) throw error;
        setAuthStatus('email_unverified');
      } else {
        const normalizedPhone = identifier.startsWith('+') ? identifier : `+${identifier}`;
        pendingPhoneRef.current = normalizedPhone;
        setPendingPhone(normalizedPhone);

        const { error } = await supabase.auth.signUp({
          phone: normalizedPhone,
          password,
          options: { data: { name: trimmedName } },
        });
        if (error) throw error;
        setAuthStatus('phone_otp_sent');
      }
    } catch (e) {
      if (method === 'email') {
        setAuthError('Не удалось зарегистрироваться. Проверьте email и попробуйте снова.');
      } else {
        setAuthError('Не удалось отправить код. Проверьте номер и попробуйте снова.');
      }
      setAuthStatus('anonymous');
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (identifier: string, password: string, method: AuthMethod) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (!isSupabaseConfigured) throw new Error('CONFIG_MISSING');

      const credentials =
        method === 'email'
          ? { email: identifier.trim(), password }
          : { phone: identifier.startsWith('+') ? identifier : `+${identifier}`, password };

      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      // onAuthStateChange handles setUser and setAuthStatus
    } catch (e) {
      setAuthError('Неверный логин или пароль. Попробуйте ещё раз.');
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyPhoneRegistration = async (code: string) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (!isSupabaseConfigured) throw new Error('CONFIG_MISSING');

      const phone = pendingPhoneRef.current;
      if (!phone) {
        setAuthError('Сначала запросите код.');
        setAuthStatus('anonymous');
        return;
      }

      const token = code.replace(/\s+/g, '');
      const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) throw error;

      const session = await supabase.auth.getSession();
      const supabaseUserId = session.data.session?.user?.id || data.user?.id;
      if (!supabaseUserId) throw new Error('AUTH_REQUIRED');

      const profile = await dataService.registerUser(
        pendingNameRef.current || 'Пользователь',
        phone,
        supabaseUserId
      );
      setUser(profile);
      setAuthStatus('authenticated');
    } catch (e) {
      setAuthError('Неверный код или срок действия истёк. Попробуйте ещё раз.');
      setAuthStatus('phone_otp_sent');
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const cancelPhoneVerification = () => {
    setAuthError(null);
    setPendingPhone('');
    pendingPhoneRef.current = '';
    setAuthStatus('anonymous');
  };

  const logout = () => {
    supabase.auth.signOut().catch(() => {});
    dataService.logout();
    setUser(null);
    setPendingPhone('');
    pendingPhoneRef.current = '';
    pendingNameRef.current = '';
    setAuthStatus('anonymous');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authStatus,
        signUp,
        signIn,
        verifyPhoneRegistration,
        cancelPhoneVerification,
        logout,
        isAuthenticated: authStatus === 'authenticated' && !!user,
        isInitializing,
        setUser,
        authError,
        authLoading,
        pendingPhone,
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
