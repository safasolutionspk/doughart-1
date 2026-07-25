"use client";

import { useState } from "react";
import { Reveal } from "@/components/animation/Reveal";
import { WordReveal } from "@/components/animation/WordReveal";
import { subscribeNewsletter } from "@/lib/api";
import { cn } from "@/lib/cn";

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
      className="section-anchor section-padding bg-white"
      aria-labelledby="newsletter-heading"
    >
      <h2 id="blog-heading" className="sr-only">
        Blog and updates
      </h2>
      <div className="section-container">
        <div className="rounded-3xl border border-brand-primary/15 bg-[#FFF9F8] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <WordReveal
              text={newsletterCopy.heading}
              as="h2"
              id="newsletter-heading"
              delay={0.05}
              className="block w-full font-display text-2xl font-bold tracking-tight text-brand-brown sm:text-3xl"
            />

            <Reveal direction="up" delay={0.2}>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-brand-muted sm:mt-4 sm:text-base">
                {newsletterCopy.description}
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.3} className="mt-6 w-full sm:mt-8">
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex w-full max-w-xl flex-col gap-3"
                aria-label="Newsletter signup"
              >
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
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
                      "h-11 w-full flex-1 rounded-full border border-brand-border/80 bg-white px-4 text-sm text-brand-brown placeholder:text-brand-muted/60",
                      "outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                    )}
                  />
                  <button
                    type="submit"
                    disabled={status === "loading" || !consent}
                    className={cn(
                      "inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full px-7 text-sm font-semibold text-white",
                      "bg-brand-primary",
                      "transition-colors hover:bg-brand-button-hover",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[8.5rem]",
                    )}
                  >
                    {status === "loading"
                      ? "Subscribing…"
                      : newsletterCopy.buttonLabel}
                  </button>
                </div>

                <label className="flex items-start justify-center gap-2 text-left text-xs leading-snug text-brand-muted">
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

            {status === "success" ? (
              <p
                className="mt-4 text-sm font-medium text-brand-primary"
                role="status"
              >
                Thank you for subscribing! We will be in touch soon.
              </p>
            ) : null}

            {status === "error" && errorMessage ? (
              <p
                className="mt-4 text-sm font-medium text-red-600"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
