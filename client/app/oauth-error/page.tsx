"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OAuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "authentication_failed";
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const getErrorMessage = () => {
    switch (reason) {
      case "access_denied":
        return "You cancelled the sign in process.";
      case "authentication_failed":
        return "Authentication failed. Please try again.";
      case "invalid_request":
        return "Invalid request. Please try again.";
      default:
        return "An error occurred during sign in. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F6F2]">
      <div className="text-center max-w-md p-6">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Error</h1>
        <p className="text-gray-600 mb-4">{getErrorMessage()}</p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          <p className="text-sm text-gray-500">
            Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OAuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F2]">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OAuthErrorContent />
    </Suspense>
  );
}

