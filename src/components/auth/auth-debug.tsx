import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export function AuthDebug() {
  const { user, loading, forceSignOut, debugAuth } = useAuth();

  const handleClearAuth = async () => {
    try {
      console.log('Clearing authentication state...');
      
      // Clear localStorage
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      
      supabaseKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log('Removed localStorage key:', key);
      });
      
      // Clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      
      sessionKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log('Removed sessionStorage key:', key);
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      console.log('Authentication state cleared successfully');
      alert('Authentication cleared! Please refresh the page.');
      
    } catch (error) {
      console.error('Error clearing auth state:', error);
      alert('Error clearing auth state. Check console for details.');
    }
  };

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('=== Current Auth Status ===');
      console.log('Session:', session);
      console.log('Error:', error);
      console.log('User from hook:', user);
      console.log('Loading:', loading);
      
      if (error) {
        console.error('Session error details:', error);
        if (error.message?.includes('user_not_found')) {
          console.log('🚨 JWT user_not_found error detected!');
          console.log('Recommended action: Clear authentication state');
        }
      }
      
      console.log('==========================');
      
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Auth Debug</CardTitle>
          <CardDescription>Loading authentication state...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Debug</CardTitle>
        <CardDescription>
          Use these tools to diagnose and fix authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
          {user && (
            <div className="text-sm text-muted-foreground">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Button onClick={debugAuth} variant="outline" className="w-full">
            Debug Auth State
          </Button>
          
          <Button onClick={checkAuthStatus} variant="outline" className="w-full">
            Check Auth Status
          </Button>
          
          <Button onClick={handleClearAuth} variant="destructive" className="w-full">
            Clear Auth State
          </Button>
          
          {user && (
            <Button onClick={forceSignOut} variant="secondary" className="w-full">
              Force Sign Out
            </Button>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
          <p><strong>If you're seeing "user_not_found" errors:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Clear Auth State"</li>
            <li>Refresh the page</li>
            <li>Sign in again</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
} 