import { isSupabaseConfigured, supabase } from '@ksebe/shared';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface WebUserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  avatar: string | null;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: WebUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; city?: string }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<WebUserProfile | null> {
  if (!supabase) return null;

  const { data: session } = await supabase.auth.getUser();
  const email = session.user?.email ?? '';

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Profile not found — create one
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({ user_id: userId, name: email.split('@')[0] })
      .select()
      .single();

    if (insertError || !newProfile) return null;

    const { data: adminResult, error: rpcError1 } = await supabase.rpc('is_admin');
    if (rpcError1) {
      console.warn('[AuthContext] is_admin RPC error:', rpcError1);
    }

    return {
      id: userId,
      email,
      name: newProfile.name,
      phone: newProfile.phone,
      city: newProfile.city,
      avatar: newProfile.avatar,
      isAdmin: adminResult === true,
      createdAt: newProfile.created_at,
    };
  }

  if (error || !data) return null;

  const { data: adminResult, error: rpcError2 } = await supabase.rpc('is_admin');
  if (rpcError2) {
    console.warn('[AuthContext] is_admin RPC error:', rpcError2);
  }

  return {
    id: userId,
    email,
    name: data.name,
    phone: data.phone,
    city: data.city,
    avatar: data.avatar,
    isAdmin: adminResult === true,
    createdAt: data.created_at,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<WebUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearError = useCallback(() => setAuthError(null), []);

  // Initialize: check existing session
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    const sb = supabase; // capture non-null reference for closures
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data } = await sb.auth.getSession();
        if (data.session?.user && isMounted) {
          const profile = await fetchProfile(data.session.user.id);
          if (isMounted) setUser(profile);
        }
      } catch {
        // Silent fail
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    const { data: sub } = sb.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (isMounted) setUser(profile);
      } else {
        if (isMounted) setUser(null);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setAuthError(null);
    if (!supabase) {
      setAuthError('Сервис авторизации не настроен.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (error.message.includes('already registered')) {
        setAuthError('Пользователь с таким email уже зарегистрирован.');
      } else {
        setAuthError('Ошибка регистрации. Попробуйте позже.');
      }
      throw error;
    }

    if (data.user) {
      // Create profile with name
      await supabase
        .from('profiles')
        .upsert({ user_id: data.user.id, name }, { onConflict: 'user_id' });

      const profile = await fetchProfile(data.user.id);
      setUser(profile);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    if (!supabase) {
      setAuthError('Сервис авторизации не настроен.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login')) {
        setAuthError('Неверный email или пароль.');
      } else {
        setAuthError('Ошибка входа. Попробуйте позже.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string; city?: string }) => {
    if (!supabase || !user) return;

    const { error } = await supabase.from('profiles').update(data).eq('user_id', user.id);

    if (error) {
      setAuthError('Не удалось обновить профиль.');
      throw error;
    }

    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authError,
        signUp,
        signIn,
        signOut,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
