"use client";

import { useState } from "react";
import { apiGet } from "@/lib/api";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";

interface LandingAuthProps {
  onLogin: (email: string, password: string) => void;
  onSignup: () => void;
  darkMode: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export default function LandingAuth({
  onLogin,
  onSignup,
  darkMode,
  isLoading = false,
  error = null,
}: LandingAuthProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      onLogin(email, password);
    } else {
      onSignup();
    }
  };

  return (
    <div
      className={`min-h-screen flex ${
        darkMode ? "bg-[#1E2A35]" : "bg-[#F9F6F2]"
      }`}
    >
      {/* Left Side - Branding/Landing */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E2A35] text-white p-12 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subsync</h1>
          <p className="text-gray-400">Smart Subscription Management</p>
        </div>

        <div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            All your subscriptions,
            <br />
            one dashboard.
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Track, optimize, and save on every subscription — from AI tools to
            streaming services.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm border border-white/20">
              Smart analysis
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm border border-white/20">
              Cost optimization
            </span>
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm border border-white/20">
              Bank level security
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <Sparkles className="w-5 h-5 text-[#007A5C]" />
              <span>Automatically detect subscriptions from your emails</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Sparkles className="w-5 h-5 text-[#007A5C]" />
              <span>Get alerts before renewals and price changes</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Sparkles className="w-5 h-5 text-[#007A5C]" />
              <span>Track spending and optimize your budget</span>
            </div>
          </div>
        </div>

        <div className="text-gray-400 text-sm">
          © 2025 Subsync. All rights reserved.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div
        className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${
          darkMode ? "bg-[#1E2A35]" : "bg-[#F9F6F2]"
        }`}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-[#1E2A35]"
              }`}
            >
              Subsync
            </h1>
            <p
              className={`text-sm mt-1 ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Smart Subscription Management
            </p>
          </div>

          {/* Toggle */}
          <div className="mb-8">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setIsLoginMode(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  isLoginMode
                    ? "bg-white text-gray-900 shadow-sm"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLoginMode(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  !isLoginMode
                    ? "bg-white text-gray-900 shadow-sm"
                    : darkMode
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2
                className={`text-2xl font-bold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {isLoginMode ? "Welcome back" : "Get started"}
              </h2>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {isLoginMode
                  ? "Sign in to manage your subscriptions"
                  : "Create an account to start tracking your subscriptions"}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!isLoginMode && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      darkMode
                        ? "bg-[#2D3748] border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-gray-900`}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    darkMode
                      ? "bg-[#2D3748] border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-gray-900`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    darkMode
                      ? "bg-[#2D3748] border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-gray-900`}
                />
              </div>
              {!isLoginMode && (
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Must be at least 6 characters
                </p>
              )}
            </div>

            {isLoginMode && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className={`text-sm font-medium ${
                    darkMode ? "text-[#007A5C]" : "text-[#007A5C]"
                  }`}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={
                isLoading || !email || !password || (!isLoginMode && !fullName)
              }
              className={`w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors ${
                darkMode ? "bg-white text-gray-900 hover:bg-gray-100" : ""
              }`}
            >
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  {isLoginMode ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <div
                className={`px-3 text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                or
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  const data = await apiGet("/api/auth/google/url");
                  const redirectUrl = data?.url || data?.redirectUrl;
                  if (redirectUrl) {
                    window.location.href = redirectUrl;
                    return;
                  }
                } catch (err) {
                  console.debug(
                    "Failed to get Google OAuth URL, falling back:",
                    err
                  );
                }

                // fallback
                window.location.href = "/api/auth/gmail";
              }}
              className={`w-full py-3 border rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                darkMode
                  ? "bg-[#2D3748] text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 533.5 544.3"
                className="w-4 h-4"
              >
                <path
                  fill="#4285f4"
                  d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.3H272v95.1h147.1c-6.3 34.1-25.1 62.9-53.6 82v68.1h86.5c50.6-46.6 80.5-115.3 80.5-194.9z"
                />
                <path
                  fill="#34a853"
                  d="M272 544.3c72.6 0 133.6-24.1 178.1-65.3l-86.5-68.1c-24.1 16.2-55 25.7-91.6 25.7-70.4 0-130.1-47.6-151.5-111.7H31.6v70.4C75.9 486.7 168.1 544.3 272 544.3z"
                />
                <path
                  fill="#fbbc04"
                  d="M120.5 325.9c-10.8-32.6-10.8-67.6 0-100.2V155.3H31.6c-41.9 81.2-41.9 177.6 0 258.8l88.9-88.2z"
                />
                <path
                  fill="#ea4335"
                  d="M272 108.3c38.5-.6 75.3 13.9 103.3 40.3l77.2-77.2C405.6 24.6 344.7 0 272 0 168.1 0 75.9 57.6 31.6 146.9l88.9 70.4C141.9 155.9 201.6 108.3 272 108.3z"
                />
              </svg>
              Continue with Google
            </button>
            {!isLoginMode && (
              <p
                className={`text-xs text-center ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
