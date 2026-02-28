"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Church, Lock, Mail } from "lucide-react";
import { clearAuthTokens, getAccessToken, getApiBaseUrl, setAuthTokens } from "@/lib/auth";
import { apiRequest } from "@/lib/api-client";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successMessage = useMemo(() => {
    if (searchParams.get("registered") === "1") {
      return "Account created successfully. Please sign in.";
    }
    return "";
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function redirectIfAuthenticated() {
      if (!getAccessToken()) {
        return;
      }

      try {
        await apiRequest("/auth/me/");
        if (isMounted) {
          router.replace("/dashboard");
        }
      } catch {
        clearAuthTokens();
      }
    }

    redirectIfAuthenticated();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.detail ?? "Sign in failed. Check your credentials.");
        return;
      }

      setAuthTokens(data.access, data.refresh);

      router.push("/auth-transition?to=/dashboard");
    } catch {
      setErrorMessage("Unable to reach server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-purple-50 p-4 md:p-8">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl border border-purple-200 bg-white shadow-sm md:grid-cols-[300px_1fr]">
        <aside className="relative hidden min-h-[680px] border-r border-purple-200 bg-gradient-to-b from-purple-950 to-purple-900 md:block">
          <div className="absolute left-8 top-12 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-purple-300/40 bg-white/10 p-2 backdrop-blur">
                <Image src="/harvest-logo.svg" alt="HICHMS logo" width={44} height={44} className="h-11 w-11" priority />
              </div>
              <div className="rounded-xl border border-purple-300/40 bg-white/10 p-2 backdrop-blur">
                <Church className="h-8 w-8 text-purple-100" strokeWidth={1.8} />
              </div>
            </div>
            <p className="mt-7 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-purple-200">Harvest</p>
            <h2 className="mt-1 text-3xl font-bold leading-none tracking-tight">HICHMS</h2>
            <p className="mt-3 text-sm font-medium leading-tight text-purple-100">Harvest Intercontinental Church</p>
            <p className="text-sm font-medium leading-tight text-purple-100">Harper Management System</p>
          </div>
        </aside>

        <section className="px-5 py-7 md:px-12 md:py-10">
          <div className="mx-auto w-full max-w-[460px]">
            <header className="mb-8 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-purple-300 bg-purple-100">
                <Image src="/harvest-logo.svg" alt="HICHMS logo" width={32} height={32} className="h-8 w-8" priority />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold leading-none tracking-tight text-purple-950">HICHMS</h1>
                  <Church className="h-5 w-5 text-purple-700" strokeWidth={2} />
                </div>
                <p className="mt-1 text-sm font-medium leading-tight text-purple-700">
                  Harvest Intercontinental Church Harper Management System
                </p>
              </div>
            </header>

            <h2 className="text-center text-3xl font-semibold tracking-tight text-purple-950">Welcome Back</h2>
            <p className="mb-6 mt-1 text-center text-sm font-medium text-purple-700">Please sign in to continue</p>

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              {successMessage ? (
                <p className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700">
                  {successMessage}
                </p>
              ) : null}
              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex h-12 items-center gap-3 rounded-xl border border-purple-300 bg-white px-4">
                <Mail className="h-4 w-4 text-purple-600" strokeWidth={2} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-full w-full bg-transparent text-sm font-medium text-purple-900 outline-none placeholder:text-purple-400"
                />
              </div>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-purple-300 bg-white px-4">
                <Lock className="h-4 w-4 text-purple-600" strokeWidth={2} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-full w-full bg-transparent text-sm font-medium text-purple-900 outline-none placeholder:text-purple-400"
                />
                <a href="#" className="text-xs font-medium text-purple-600 hover:text-purple-800">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-12 w-full rounded-xl border border-purple-700 bg-purple-700 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>

              <label className="mt-1 flex items-center gap-2 text-sm font-medium text-purple-800">
                <input type="checkbox" className="h-4 w-4 accent-purple-700" defaultChecked />
                Remember Me
              </label>

              <p className="text-sm font-medium text-purple-800">
                Don&apos;t have an account? <span className="font-semibold text-purple-600">Contact the Administrator</span>
              </p>

              <div className="my-2 flex items-center gap-3 text-purple-400">
                <div className="h-px flex-1 bg-purple-200" />
                <span className="text-xs font-medium text-purple-500">Or sign in with</span>
                <div className="h-px flex-1 bg-purple-200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="h-10 rounded-lg border border-purple-300 bg-white text-xs font-semibold text-purple-800"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="h-10 rounded-lg border border-purple-300 bg-purple-100 text-xs font-semibold text-purple-800"
                >
                  Facebook
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-purple-800">
              New here? <Link href="/signup" className="font-semibold text-purple-700 hover:text-purple-900">Create account</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
