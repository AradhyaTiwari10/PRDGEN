"use client";

import { useState } from "react";
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

        // Navigate to dashboard with prompt parameter if it exists
        if (promptParam) {
          navigate(`/dashboard?prompt=${encodeURIComponent(promptParam)}`);
        } else {
          navigate("/dashboard");
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
