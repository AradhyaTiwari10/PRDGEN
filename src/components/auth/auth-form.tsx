"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthData = z.infer<typeof authSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Capture prompt parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const promptParam = urlParams.get('prompt');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthData>({
    resolver: zodResolver(authSchema),
  });

  // Check current authentication state on mount
  useEffect(() => {
    const checkCurrentAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Current auth state on mount:', { 
        session: !!session, 
        user: session?.user?.email, 
        error,
        sessionData: session 
      });
    };
    checkCurrentAuth();
  }, []);

  // Monitor authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔍 Auth state change event:', event);
      console.log('📋 Session data:', session);
      console.log('👤 User email:', session?.user?.email);
      console.log('🆔 User ID:', session?.user?.id);
      
      if (event === 'INITIAL_SESSION') {
        console.log('🔄 Initial session check - this is normal on page load');
        if (session?.user) {
          console.log('✅ User already signed in:', session.user.email);
        } else {
          console.log('❌ No active session found');
        }
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User successfully signed in!');
        console.log('👤 User email:', session.user.email);
        console.log('🆔 User ID:', session.user.id);
        console.log('📧 User details:', {
          email: session.user.email,
          id: session.user.id,
          user_metadata: session.user.user_metadata,
          app_metadata: session.user.app_metadata
        });
        
        toast({
          title: "Welcome!",
          description: `Successfully signed in as ${session.user.email}`,
        });
        
        // Navigate to landing page with prompt parameter if it exists
        if (promptParam) {
          navigate(`/?prompt=${encodeURIComponent(promptParam)}`);
        } else {
          navigate("/");
        }
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed for user:', session?.user?.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, promptParam]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      console.log('🚀 Starting Google OAuth sign in...');
      console.log('📍 Current URL:', window.location.href);
      console.log('🎯 Redirect URL:', `${window.location.origin}/${promptParam ? `?prompt=${encodeURIComponent(promptParam)}` : ''}`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${promptParam ? `?prompt=${encodeURIComponent(promptParam)}` : ''}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      console.log('📡 OAuth response:', { data, error });

      if (error) {
        console.error('❌ OAuth error:', error);
        throw error;
      }

      if (data) {
        console.log('✅ OAuth data received:', data);
        console.log('🔗 OAuth URL:', data.url);
        
        // If we get a URL back, it means we need to redirect
        if (data.url) {
          console.log('🔄 Redirecting to Google OAuth...');
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error('💥 Google sign in error:', error);
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onSubmit = async (data: AuthData) => {
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });

        // Navigate to landing page with prompt parameter if it exists
        if (promptParam) {
          navigate(`/?prompt=${encodeURIComponent(promptParam)}`);
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-[#0f0f11]/60 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl">

      <CardHeader>
        <CardTitle className="text-foreground">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {mode === "login"
            ? "Sign in to your account to continue"
            : "Sign up to start generating PRDs"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Google Sign In Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4 bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </div>
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0f0f11]/60 px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
            className="bg-[#0f0f11] border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/20 rounded-xl"

              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
            className="bg-[#0f0f11] border border-white/10 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-white/20 focus:border-white/20 rounded-xl"

              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : mode === "login"
              ? "Sign In"
              : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
