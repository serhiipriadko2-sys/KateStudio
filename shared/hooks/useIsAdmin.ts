/**
 * useIsAdmin Hook
 * Checks if the current authenticated user has admin privileges
 * via Supabase Auth + profiles.is_admin flag
 */

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface UseIsAdminReturn {
  isAdmin: boolean;
  isLoading: boolean;
  user: User | null;
}

export const useIsAdmin = (): UseIsAdminReturn => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // If Supabase is not configured, fail immediately
    if (!isSupabaseConfigured) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const checkAdminStatus = async () => {
      try {
        // 1. Get current authenticated user
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !currentUser) {
          setIsAdmin(false);
          setUser(null);
          setIsLoading(false);
          return;
        }

        setUser(currentUser);

        // 2. Fetch user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', currentUser.id)
          .single();

        if (profileError || !profile) {
          console.warn('[useIsAdmin] Profile not found or error:', profileError);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // 3. Set admin status based on profile flag
        setIsAdmin(profile.is_admin === true);
      } catch (err) {
        console.error('[useIsAdmin] Unexpected error:', err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setIsAdmin(false);
        setUser(null);
        setIsLoading(false);
      } else {
        // Re-check admin status when user logs in
        setIsLoading(true);
        checkAdminStatus();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading, user };
};
