"use client";

import { DashboardSidebar } from "./sidebar";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { clearAuthTokens, getAccessToken } from "@/lib/auth";
import { Loader2 } from "lucide-react";

type DashboardContentShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

type AuthUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
};

export function DashboardContentShell({ title, subtitle, children }: DashboardContentShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  function redirectToSignin() {
    const nextPath = encodeURIComponent(pathname || "/dashboard");
    const signinUrl = `/signin?next=${nextPath}`;
    router.replace(signinUrl);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        window.location.assign(signinUrl);
      }, 150);
    }
  }

  function handleLogout() {
    setIsUserMenuOpen(false);
    clearAuthTokens();
    router.replace("/auth-transition?mode=out&to=/signin");
  }

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      const accessToken = getAccessToken();
      if (!accessToken) {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
        redirectToSignin();
        return;
      }

      try {
        const me = await apiRequest<AuthUser>("/auth/me/", undefined, { timeoutMs: 10000 });
        if (isMounted) {
          setUser(me);
          setIsCheckingAuth(false);
        }
      } catch {
        clearAuthTokens();
        if (isMounted) {
          setIsCheckingAuth(false);
        }
        redirectToSignin();
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!isUserMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;
      if (userMenuRef.current && target && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isUserMenuOpen]);

  if (isCheckingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-purple-50">
        <p className="text-sm font-medium text-purple-700">Checking session...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-purple-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={22} className="animate-spin text-purple-600" />
          <p className="text-sm font-medium text-purple-700">Session unavailable. Redirecting to sign in...</p>
          <button
            type="button"
            onClick={redirectToSignin}
            className="rounded-lg border border-purple-500 bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
          >
            Go to Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-50 p-2 md:p-4">
      <div className="mx-auto flex min-h-[92vh] w-full max-w-[1400px] overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-xl shadow-purple-200/50">
        <DashboardSidebar />

        <section className="flex-1">
          <header className="flex flex-wrap items-center justify-between border-b border-purple-200 bg-white px-6 py-4">
            <div>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-purple-950">{title}</h1>
              <p className="mt-1 text-sm font-medium text-purple-700">{subtitle}</p>
            </div>
            <div ref={userMenuRef} className="relative flex items-center gap-3">
              <span className="rounded-full border border-purple-300 bg-purple-100 px-4 py-1 text-xs font-semibold tracking-tight text-purple-800">
                {(user?.role ?? "super_admin").replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
              </span>

              <button
                type="button"
                onClick={() => setIsUserMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full border border-purple-300 bg-white px-2 py-1 hover:bg-purple-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-300 bg-purple-100 text-xs font-semibold text-purple-700">
                  {user?.full_name
                    ?.split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((name) => name[0]?.toUpperCase())
                    .join("") || "SA"}
                </div>
                <span className="pr-1 text-xs font-semibold text-purple-700">⌄</span>
              </button>

              {isUserMenuOpen ? (
                <div className="absolute right-0 top-14 z-20 w-64 rounded-xl border border-purple-200 bg-white p-3 shadow-lg">
                  <p className="text-sm font-semibold text-purple-900">{user?.full_name || "Super Admin"}</p>
                  <p className="mt-1 text-xs text-purple-700">{user?.email || "admin@hichms.local"}</p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 w-full rounded-lg border border-purple-300 bg-white px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </header>

          <div className="space-y-6 p-4 md:p-6">
            {children}
            <footer className="rounded-3xl border border-purple-200 bg-white py-6 text-center text-base font-medium text-purple-700 shadow-sm">
              © 2026 Harvest Intercontinental Church Harper Management System
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
