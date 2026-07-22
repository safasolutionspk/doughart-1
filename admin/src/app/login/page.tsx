import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

function LoginFormFallback() {
  return (
    <div className="space-y-5" aria-hidden>
      <div className="h-11 animate-pulse rounded-xl bg-brand-pink-lighter" />
      <div className="h-11 animate-pulse rounded-xl bg-brand-pink-lighter" />
      <div className="h-11 animate-pulse rounded-xl bg-brand-pink-light" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <section className="relative hidden w-[42%] overflow-hidden bg-linear-to-br from-brand-pink-lighter via-white to-brand-pink-light lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div>
          <p className="admin-eyebrow">DoughArt Admin</p>
          <h1 className="mt-6 max-w-sm font-display text-3xl font-bold leading-tight text-brand-brown">
            Your bakery command center
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-muted">
            Manage orders, custom cake quotes, catalog, and payments — crafted for
            a premium cake business.
          </p>
        </div>
        <p className="text-xs text-brand-muted">Authorized staff only</p>
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-primary/10 blur-2xl"
          aria-hidden
        />
      </section>

      <section className="flex flex-1 items-center justify-center bg-brand-cream px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="admin-eyebrow">DoughArt Admin</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-brand-brown">
              Sign in
            </h1>
          </div>

          <div className="admin-card">
            <div className="mb-6 hidden lg:block">
              <h2 className="font-display text-xl font-semibold text-brand-brown">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-brand-muted">
                Enter your credentials to continue.
              </p>
            </div>

            <Suspense fallback={<LoginFormFallback />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
