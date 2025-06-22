import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        
        // Handle specific JWT user_not_found error
        if (error.message?.includes('user_not_found') || error.message?.includes('JWT')) {
          console.log('JWT error detected, clearing session...');
          supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        // Verify user exists in database when token is refreshed
        if (session?.user) {
          verifyUserExists(session.user.id);
        }
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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

  return {
    user,
    loading,
    signOut,
    forceSignOut,
    debugAuth,
    isAuthenticated: !!user,
  };
} 