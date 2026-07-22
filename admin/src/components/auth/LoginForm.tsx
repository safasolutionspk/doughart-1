"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/dashboard";
  const sessionReason = searchParams.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const body = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !body.success) {
        setStatus("error");
        setErrorMessage(body.message ?? "Invalid email or password");
        return;
      }

      router.replace(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Unable to sign in. Please try again.");
    }
  }

  const isLoading = status === "loading";

  const sessionNotice =
    sessionReason === "session-expired"
      ? "Your session has expired. Please sign in again."
      : sessionReason === "auth-required"
        ? "Please sign in to continue."
        : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
      {sessionNotice ? (
        <p
          className="rounded-xl border border-brand-border bg-brand-pink-lighter px-3.5 py-2.5 text-sm text-brand-brown"
          role="status"
        >
          {sessionNotice}
        </p>
      ) : null}
      <div>
        <label htmlFor="email" className="admin-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isLoading}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="admin-input"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="admin-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isLoading}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="admin-input"
          placeholder="••••••••"
        />
      </div>

      {status === "error" && errorMessage ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <button type="submit" disabled={isLoading} className="admin-btn-primary w-full">
        {isLoading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
