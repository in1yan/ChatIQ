"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Expected format from backend: #refresh_token=...
    const hash = window.location.hash;
    if (hash) {
      // Remove the leading '#' and parse parameters
      const params = new URLSearchParams(hash.substring(1));
      const refreshToken = params.get("refresh_token");

      if (refreshToken) {
        // Persist token for future API requests
        localStorage.setItem("chatiq_refresh_token", refreshToken);
        // User requested redirect to onboarding
        router.push("/onboarding");
      } else {
        router.push("/auth/error?error=missing_token");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4 text-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-zinc-400 animate-pulse">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}
