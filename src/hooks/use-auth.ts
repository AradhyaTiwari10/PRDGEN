import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Global cache to prevent multiple simultaneous auth requests
let authPromise: Promise<{ user: User | null; error: any }> | null = null;
let lastAuthCheck = 0;
const AUTH_CACHE_DURATION = 5000; // 5 seconds cache

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isInitialized = useRef(false);

  // Centralized auth check with caching
  const checkAuth = async (force = false): Promise<{ user: User | null; error: any }> => {
    const now = Date.now();
    
    // Return cached result if within cache duration and not forced
    if (!force && authPromise && (now - lastAuthCheck) < AUTH_CACHE_DURATION) {
      return authPromise;
    }

    // If there's already a request in progress, wait for it
    if (authPromise && !force) {
      return authPromise;
    }

    // Create new auth check
    authPromise = (async () => {
      try {
        console.log('🔍 Checking authentication...');
        const { data: { session }, error } = await supabase.auth.getSession();
        lastAuthCheck = now;
        
        if (error) {
          console.error('Session error:', error);
          
          // Handle specific JWT user_not_found error
          if (error.message?.includes('user_not_found') || error.message?.includes('JWT')) {
            console.log('JWT error detected, clearing session...');
            await supabase.auth.signOut();
            return { user: null, error };
          }
          return { user: null, error };
        }
        
        const user = session?.user ?? null;
        console.log('✅ Auth check complete:', user ? user.email : 'No user');
        return { user, error: null };
      } catch (error) {
        console.error('Auth check failed:', error);
        return { user: null, error };
      }
    })();

    return authPromise;
  };

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Initial auth check
    checkAuth().then(({ user, error }) => {
      setUser(user);
      setLoading(false);
    });

    // Single auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event);
      
      if (event === 'INITIAL_SESSION') {
        console.log('🔄 Initial session check');
        const user = session?.user ?? null;
        setUser(user);
        setLoading(false);
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('✅ User signed in or token refreshed');
        const user = session?.user ?? null;
        setUser(user);
        setLoading(false);
        
        // Only verify user exists on SIGNED_IN, not TOKEN_REFRESHED
        if (event === 'SIGNED_IN' && user) {
          verifyUserExists(user.id);
        }
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
        setUser(null);
        setLoading(false);
        return;
      }
    });

    return () => {
      subscription.unsubscribe();
      isInitialized.current = false;
    };
  }, []);

  const verifyUserExists = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
        
      if (error && error.message?.includes('user_not_found')) {
        console.error('User not found in database, signing out...');
        await supabase.auth.signOut();
        setUser(null);
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any local state
      setUser(null);
      
      // Navigate to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const forceSignOut = async () => {
    try {
      // Force clear local storage
      localStorage.clear();
      
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear any local state
      setUser(null);
      
      // Navigate to home page
      navigate('/', { replace: true });
      
      console.log('Forced sign out completed');
    } catch (error) {
      console.error('Error in force sign out:', error);
      // Even if there's an error, clear local state
      setUser(null);
      navigate('/', { replace: true });
    }
  };

  const debugAuth = () => {
    console.log('=== Auth Debug Info ===');
    console.log('User:', user);
    console.log('Loading:', loading);
    console.log('Is Authenticated:', !!user);
    console.log('LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('supabase')));
    console.log('======================');
  };

  const refreshSession = async () => {
    console.log('🔄 Manually refreshing session...');
    try {
      const { user, error } = await checkAuth(true); // Force refresh
      
      if (error) {
        console.error('❌ Session refresh error:', error);
      } else if (user) {
        console.log('✅ Session refreshed successfully for:', user.email);
        setUser(user);
      } else {
        console.log('❌ No session found after refresh');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Session refresh failed:', error);
    }
  };

  return {
    user,
    loading,
    signOut,
    forceSignOut,
    debugAuth,
    refreshSession,
    isAuthenticated: !!user,
  };
} 