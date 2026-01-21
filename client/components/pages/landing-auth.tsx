"use client";

import { apiGet } from "@/lib/api";
import { Sparkles } from "lucide-react";

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
  const handleGoogleAuth = async () => {
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

          {/* Main Content */}
          <div className="space-y-6">
            <div>
              <h2
                className={`text-3xl font-bold mb-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Welcome to Subsync
              </h2>
              <p
                className={`text-base ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Connect with Google to start managing your subscriptions
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className={`w-full py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors text-lg ${
                darkMode ? "bg-white text-gray-900 hover:bg-gray-100" : ""
              }`}
            >
              {isLoading ? (
                "Connecting..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 533.5 544.3"
                    className="w-5 h-5"
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
                </>
              )}
            </button>

            <p
              className={`text-xs text-center ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
