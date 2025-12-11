"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "../lib/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLandingAuth, setShowLandingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Check authentication status on mount by calling backend
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiGet("/api/auth/me");
        if (res?.user) {
          setIsAuthenticated(true);
          setShowLandingAuth(false);
          // Keep existing onboarding flow (frontend still uses onboarding flag stored locally)
          const onboardingCompleted = localStorage.getItem(
            "onboarding_completed"
          );
          if (!onboardingCompleted) {
            setShowOnboarding(true);
          }
        }
      } catch (error: unknown) {
        // Not authenticated or failed to reach API - remain unauthenticated
        console.debug("Auth check failed:", error);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = useCallback(
    async (email: string, password: string, onSuccess?: () => void) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        // Simulate API call - replace with actual Supabase auth
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Call backend login endpoint. Backend will set HTTP-only cookie.
        const data = await apiPost("/api/auth/login", { email, password });
        if (data?.user) {
          setIsAuthenticated(true);
          setShowLandingAuth(false);
          setShowOnboarding(false); // Skip onboarding for existing users
          onSuccess?.();
        } else {
          throw new Error("Invalid login response");
        }
      } catch (error: unknown) {
        setAuthError(
          error instanceof Error
            ? error.message
            : "Failed to sign in. Please try again."
        );
      } finally {
        setAuthLoading(false);
      }
    },
    []
  );

  const handleSignup = useCallback(() => {
    setShowLandingAuth(false);
    setShowOnboarding(true);
    setIsAuthenticated(true); // Set authenticated so they can proceed after onboarding
  }, []);

  return {
    isAuthenticated,
    showLandingAuth,
    showOnboarding,
    authError,
    authLoading,
    setIsAuthenticated,
    setShowLandingAuth,
    setShowOnboarding,
    handleLogin,
    handleSignup,
  };
}
