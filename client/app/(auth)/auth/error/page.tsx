"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message") || "Authentication failed. Please try logging in again.";

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 p-6">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center text-zinc-50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
          <p className="text-sm text-zinc-400">
            {message}
          </p>
          {error && (
            <p className="text-xs text-zinc-600 font-mono mt-2">Error code: {error}</p>
          )}
        </div>

        <Link 
          href="/login"
          className="mt-6 rounded-md bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white active:scale-95"
        >
          Return to Sign in
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
