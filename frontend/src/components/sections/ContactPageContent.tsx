import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { footerCopy } from "@/lib/footer";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/cn";

const inputClassName = cn(
  "w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-brown",
  "placeholder:text-brand-muted/60 outline-none transition-shadow",
  "focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
);

export function ContactPageContent() {
  const whatsappHref = buildWhatsAppUrl(
    "Hello! I would like to enquire about a custom cake from DoughArt.",
  );

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-brown sm:text-2xl">
          Get in touch
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
          We would love to hear about your celebration. Reach out by phone,
          WhatsApp, or email — we typically respond within one business day.
        </p>

        <ul className="mt-6 space-y-4">
          <li className="flex items-start gap-3 rounded-2xl border border-brand-border/50 bg-white/90 px-4 py-3 shadow-sm">
            <ContactIcon label="Phone">📞</ContactIcon>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Phone
              </p>
              <a
                href={siteConfig.phoneHref}
                className="mt-0.5 text-sm font-medium text-brand-primary hover:underline"
              >
                {siteConfig.phone}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-brand-border/50 bg-white/90 px-4 py-3 shadow-sm">
            <ContactIcon label="WhatsApp">💬</ContactIcon>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                WhatsApp
              </p>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 text-sm font-medium text-brand-primary hover:underline"
              >
                {siteConfig.whatsapp}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-brand-border/50 bg-white/90 px-4 py-3 shadow-sm">
            <ContactIcon label="Email">✉️</ContactIcon>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Email
              </p>
              <a
                href={footerCopy.emailHref}
                className="mt-0.5 break-all text-sm font-medium text-brand-primary hover:underline"
              >
                {footerCopy.email}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3 rounded-2xl border border-brand-border/50 bg-white/90 px-4 py-3 shadow-sm">
            <ContactIcon label="Address">📍</ContactIcon>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                Bakery
              </p>
              <p className="mt-0.5 text-sm text-brand-muted">{siteConfig.address}</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-brand-border/60 bg-gradient-to-b from-white to-brand-pink-lighter/40 p-5 shadow-md sm:p-6">
        <h2 className="font-display text-lg font-semibold text-brand-brown">
          Send a message
        </h2>
        <p className="mt-2 text-sm text-brand-muted">
          Share your event date, cake ideas, and guest count. We will reply on
          WhatsApp or email — no form is stored on our website.
        </p>
        <ContactForm whatsappHref={whatsappHref} />
      </div>
    </div>
  );
}

function ContactIcon({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-pink-lighter text-lg"
      aria-hidden
    >
      <span className="sr-only">{label}</span>
      {children}
    </span>
  );
}

function ContactForm({ whatsappHref }: { whatsappHref: string }) {
  const waBase = whatsappHref.split("?")[0];

  return (
    <form
      className="mt-5 space-y-4"
      action={waBase}
      method="get"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-brown">
          Message
        </label>
        <textarea
          id="contact-message"
          name="text"
          rows={4}
          required
          className={cn(inputClassName, "resize-y")}
          placeholder="Hi! I would like to enquire about a custom cake..."
          defaultValue="Hello! I would like to enquire about a custom cake from DoughArt."
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="md">
          Send via WhatsApp
        </Button>
        <Link
          href={`${footerCopy.emailHref}?subject=${encodeURIComponent("DoughArt enquiry")}`}
          className="inline-flex h-10 items-center justify-center rounded-full border-2 border-brand-primary px-5 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-pink-lighter"
        >
          Email us
        </Link>
      </div>
    </form>
  );
}
