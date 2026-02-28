"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Church, Lock, Mail, UserRound } from "lucide-react";
import { clearAuthTokens, getAccessToken, getApiBaseUrl } from "@/lib/auth";
import { apiRequest } from "@/lib/api-client";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const firstError = Object.values(data ?? {})?.[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          setErrorMessage(String(firstError[0]));
        } else if (typeof firstError === "string") {
          setErrorMessage(firstError);
        } else {
          setErrorMessage("Unable to create account.");
        }
        return;
      }

      router.push("/signin?registered=1");
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

            <h2 className="mb-1 text-center text-3xl font-semibold tracking-tight text-purple-950">
              Welcome Onboard
            </h2>
            <p className="mb-6 text-center text-sm font-medium text-purple-700">Create your account to continue</p>

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              {errorMessage ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex h-12 items-center gap-3 rounded-xl border border-purple-300 bg-white px-4">
                <UserRound className="h-4 w-4 text-purple-600" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="h-full w-full bg-transparent text-sm font-medium text-purple-900 outline-none placeholder:text-purple-400"
                />
              </div>
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
              </div>
              <div className="flex h-12 items-center gap-3 rounded-xl border border-purple-300 bg-white px-4">
                <Lock className="h-4 w-4 text-purple-600" strokeWidth={2} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-full w-full bg-transparent text-sm font-medium text-purple-900 outline-none placeholder:text-purple-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-12 w-full rounded-xl border border-purple-700 bg-purple-700 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-medium text-purple-800">
              Already have an account? <Link href="/signin" className="font-semibold text-purple-700 hover:text-purple-900">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
