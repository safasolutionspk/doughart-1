"use client";

import { useState } from "react";
import { Reveal } from "@/components/animation/Reveal";
import { WordReveal } from "@/components/animation/WordReveal";
import { subscribeNewsletter } from "@/lib/api";
import { cn } from "@/lib/cn";
import { siteImages } from "@/lib/images";

const newsletterCopy = {
  heading: "Be The First To Know!",
  description:
    "Subscribe for new cake designs, seasonal flavours, and exclusive bakery offers.",
  placeholder: "Enter your email address",
  buttonLabel: "Subscribe",
  consentLabel: "I agree to receive marketing emails from DoughArt",
} as const;

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [envelopeFailed, setEnvelopeFailed] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();

    if (!trimmed || !consent) {
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      await subscribeNewsletter(trimmed, "homepage", consent);
      setStatus("success");
      setEmail("");
      setConsent(false);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not subscribe. Please try again.",
      );
    }
  }

  return (
    <section
      id="blog"
      className="section-anchor section-padding bg-brand-cream"
      aria-labelledby="newsletter-heading"
    >
      <h2 id="blog-heading" className="sr-only">
        Blog and updates
      </h2>
      <div className="section-container">
        <div className="relative overflow-hidden rounded-3xl border border-brand-border/50 bg-gradient-to-r from-brand-pink-lighter/80 via-white to-brand-pink-lighter/60 px-5 py-6 shadow-sm shadow-brand-primary/5 sm:px-8 sm:py-8">
          <div className="relative flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <Reveal direction="left" className="flex max-w-md flex-col items-center gap-4 text-center lg:flex-row lg:items-center lg:gap-6 lg:text-left">
              {!envelopeFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={siteImages.envelope}
                  alt=""
                  width={72}
                  height={72}
                  className="h-14 w-auto shrink-0 object-contain drop-shadow-sm sm:h-16"
                  style={{ background: "transparent" }}
                  onError={() => setEnvelopeFailed(true)}
                  aria-hidden
                />
              ) : (
                <EnvelopeIcon className="h-12 w-12 shrink-0 text-brand-primary sm:h-14 sm:w-14" />
              )}
              <div>
                <WordReveal
                  text={newsletterCopy.heading}
                  as="h2"
                  id="newsletter-heading"
                  delay={0.1}
                  className="block w-full font-display text-xl font-bold tracking-tight text-brand-brown sm:text-2xl"
                />
                <Reveal direction="up" delay={0.35}>
                  <p className="mt-2 text-xs leading-relaxed text-brand-muted sm:text-sm">
                    {newsletterCopy.description}
                  </p>
                </Reveal>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.2}>
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-2.5"
              aria-label="Newsletter signup"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  disabled={status === "loading"}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status === "success" || status === "error") {
                      setStatus("idle");
                      setErrorMessage(null);
                    }
                  }}
                  placeholder={newsletterCopy.placeholder}
                  className={cn(
                    "h-10 w-full flex-1 rounded-full border border-brand-border bg-white px-4 text-sm text-brand-brown placeholder:text-brand-muted/60",
                    "outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                />
                <button
                  type="submit"
                  disabled={status === "loading" || !consent}
                  className={cn(
                    "inline-flex h-10 w-full shrink-0 items-center justify-center rounded-full px-6 text-sm font-semibold text-white",
                    "bg-brand-button-hover shadow-lg shadow-brand-button-hover/40",
                    "transition-colors hover:bg-brand-primary hover:shadow-xl hover:shadow-brand-primary/35",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-button-hover focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[8.5rem]",
                  )}
                >
                  {status === "loading" ? "Subscribing…" : newsletterCopy.buttonLabel}
                </button>
              </div>

              <label className="flex items-start gap-2 text-left text-xs text-brand-muted">
                <input
                  type="checkbox"
                  name="consent"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  disabled={status === "loading"}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-border text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
                <span>{newsletterCopy.consentLabel}</span>
              </label>
            </form>
            </Reveal>
          </div>

          {status === "success" && (
            <p
              className="mt-4 text-center text-sm font-medium text-brand-primary lg:text-left lg:pl-[5.5rem]"
              role="status"
            >
              Thank you for subscribing! We will be in touch soon.
            </p>
          )}

          {status === "error" && errorMessage ? (
            <p
              className="mt-4 text-center text-sm font-medium text-red-600 lg:text-left lg:pl-[5.5rem]"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}
          </div>
      </div>
    </section>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6h16v12H4V6z" />
      <path d="M4 8l8 5 8-5" />
      <path d="M4 6l8 5 8-5" />
    </svg>
  );
}
