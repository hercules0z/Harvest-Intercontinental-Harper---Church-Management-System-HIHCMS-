"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthTransitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "out" ? "out" : "in";

  useEffect(() => {
    const target = searchParams.get("to") ?? "/dashboard";
    const safeTarget = target.startsWith("/") ? target : "/dashboard";

    const timeoutId = window.setTimeout(() => {
      router.replace(safeTarget);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router, searchParams]);

  return (
    <main className="grid min-h-screen place-items-center bg-purple-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-purple-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-purple-200 border-t-purple-700" />
        <h1 className="text-lg font-semibold text-purple-900">
          {mode === "out" ? "Signing you out..." : "Signing you in..."}
        </h1>
        <p className="mt-1 text-sm text-purple-700">
          {mode === "out" ? "Redirecting to login." : "Preparing your dashboard."}
        </p>
      </div>
    </main>
  );
}
