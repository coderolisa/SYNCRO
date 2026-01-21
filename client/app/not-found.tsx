import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F9F6F2] dark:bg-[#1E2A35] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-6xl font-bold text-[#1E2A35] dark:text-[#F9F6F2]">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[#1E2A35] dark:text-[#F9F6F2]">
          Page Not Found
        </h2>
        <p className="text-[#1E2A35]/70 dark:text-[#F9F6F2]/70">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

