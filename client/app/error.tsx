"use client";

import { useEffect } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F9F6F2] dark:bg-[#1E2A35] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#1E2A35] dark:text-[#F9F6F2]">
          Something went wrong!
        </h2>
        <p className="text-[#1E2A35]/70 dark:text-[#F9F6F2]/70">
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p className="text-sm text-[#1E2A35]/50 dark:text-[#F9F6F2]/50">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

