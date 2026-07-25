import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { SocialIcon } from "@/components/icons/SocialIcon";
import {
  customerServiceLinks,
  footerCopy,
  myAccountLinks,
  quickLinks,
} from "@/lib/footer";
import { externalLinkProps, isExternalHref } from "@/lib/links";
import { siteImages } from "@/lib/images";
import { siteConfig, socialLinks } from "@/lib/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

const socialIconMap = {
  Facebook: "facebook",
  Instagram: "instagram",
  WhatsApp: "whatsapp",
} as const;

const socialIconClassName =
  "flex h-9 w-9 items-center justify-center rounded-full border border-brand-border/80 bg-white text-brand-primary transition-colors duration-200 hover:border-brand-primary hover:bg-brand-primary hover:text-white";

const footerSocialLinks = [
  ...socialLinks,
  {
    label: "WhatsApp" as const,
    href: buildWhatsAppUrl("Hello! I would like to know more about your cakes."),
  },
];

const footerLinkClassName =
  "text-sm text-brand-muted transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:text-brand-primary";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="section-anchor relative overflow-hidden border-t border-brand-border/70 bg-[#FFF8FA] text-brand-brown"
      aria-label="Site footer"
    >
      <div className="section-container relative pb-8 pt-8 sm:pb-10 sm:pt-10 lg:pb-12 lg:pt-12">
        <div
          className={cn(
            "grid items-start gap-x-6 gap-y-8",
            "grid-cols-1",
            "min-[480px]:grid-cols-2",
            "lg:grid-cols-5 lg:gap-x-8",
          )}
        >
          {/* COLUMN 1 — Brand / About */}
          <Reveal direction="up" delay={0} className="min-[480px]:col-span-2 lg:col-span-1">
            <div className="max-w-sm">
              <Link
                href="/"
                className="group inline-flex max-w-full items-center gap-3 transition-opacity hover:opacity-90 sm:gap-3.5"
                aria-label={`${siteConfig.name} home`}
              >
                <Image
                  src={siteImages.logo}
                  alt=""
                  width={167}
                  height={89}
                  unoptimized
                  className="h-auto w-[4.5rem] shrink-0 object-contain object-left sm:w-[5rem] lg:w-[5.5rem]"
                />
                <span className="min-w-0">
                  <span className="block font-display text-2xl font-bold leading-none tracking-tight text-brand-primary sm:text-[1.75rem]">
                    {siteConfig.name}
                  </span>
                  <span className="mt-1.5 block text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brand-brown/75 sm:text-[0.6875rem] sm:tracking-[0.24em]">
                    {footerCopy.brandLine}
                  </span>
                </span>
              </Link>

              <p className="mt-4 text-sm leading-relaxed text-brand-muted">
                {footerCopy.description}
              </p>

              <ul
                className="mt-5 flex flex-wrap gap-2"
                aria-label="Social media"
              >
                {footerSocialLinks.map((social) => {
                  const iconName =
                    socialIconMap[social.label as keyof typeof socialIconMap];
                  return (
                    <li key={social.label}>
                      <Link
                        href={social.href}
                        aria-label={`${social.label} (opens in new tab)`}
                        className={socialIconClassName}
                        {...(isExternalHref(social.href) ? externalLinkProps : {})}
                      >
                        <SocialIcon
                          name={iconName}
                          className="h-4 w-4"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          {/* COLUMN 2 — Quick Links */}
          <Reveal direction="up" delay={0.08}>
            <FooterColumn title="Quick Links" links={quickLinks} />
          </Reveal>

          {/* COLUMN 3 — Customer Service */}
          <Reveal direction="up" delay={0.12}>
            <FooterColumn title="Customer Service" links={customerServiceLinks} />
          </Reveal>

          {/* COLUMN 4 — My Account */}
          <Reveal direction="up" delay={0.16}>
            <FooterColumn title="My Account" links={myAccountLinks} />
          </Reveal>

          {/* COLUMN 5 — Contact Us */}
          <Reveal direction="up" delay={0.2}>
            <div>
              <h3 className="font-display text-sm font-bold tracking-tight text-brand-brown sm:text-[0.9375rem]">
                Contact Us
              </h3>
              <ul className="mt-3.5 space-y-3">
                <li className="flex items-start gap-2.5">
                  <ContactIcon>
                    <LocationIcon className="h-3.5 w-3.5" />
                  </ContactIcon>
                  <span className="pt-0.5 text-sm leading-relaxed text-brand-muted">
                    {siteConfig.address}
                  </span>
                </li>
                <li>
                  <a
                    href={siteConfig.phoneHref}
                    className="group/contact flex items-center gap-2.5 transition-colors"
                  >
                    <ContactIcon>
                      <PhoneIcon className="h-3.5 w-3.5" />
                    </ContactIcon>
                    <span className="text-sm text-brand-muted transition-colors group-hover/contact:text-brand-primary">
                      {siteConfig.phone}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={footerCopy.emailHref}
                    className="group/contact flex items-start gap-2.5 transition-colors"
                  >
                    <ContactIcon>
                      <EmailIcon className="h-3.5 w-3.5" />
                    </ContactIcon>
                    <span className="break-all pt-0.5 text-sm leading-snug text-brand-muted transition-colors group-hover/contact:text-brand-primary">
                      {footerCopy.email}
                    </span>
                  </a>
                </li>
              </ul>

              <div className="mt-6 border-t border-brand-border/50 pt-5">
                <h3 className="font-display text-sm font-bold tracking-tight text-brand-brown sm:text-[0.9375rem]">
                  Website Developed By
                </h3>
                <p className="mt-3.5 text-sm text-brand-muted">Safa Solutions</p>
                <ul className="mt-2.5 space-y-2.5">
                  <li>
                    <a
                      href="https://safasolutions.org"
                      className={footerLinkClassName}
                      {...externalLinkProps}
                    >
                      safasolutions.org
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/safasolutions/"
                      className={cn(
                        "inline-flex min-h-7 items-center gap-1.5 rounded-sm font-medium text-rose-500",
                        "drop-shadow-[0_0_4px_rgba(244,63,94,0.35)] transition-colors hover:text-rose-600",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2",
                        "motion-safe:animate-[pulse_3s_ease-in-out_infinite] motion-reduce:animate-none",
                      )}
                      {...externalLinkProps}
                    >
                      <SocialIcon name="instagram" className="h-3.5 w-3.5" />
                      Visit our Instagram profile
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="border-t border-brand-border/60 bg-[#FFF1F4]/70">
        <div className="section-container flex flex-col gap-1 py-3 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between sm:py-3.5">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="italic text-brand-muted/90">{siteConfig.slogan}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold tracking-tight text-brand-brown sm:text-[0.9375rem]">
        {title}
      </h3>
      <ul className="mt-3.5 space-y-2.5">
        {links.map((link) => (
          <li key={`${title}-${link.href}-${link.label}`}>
            <Link href={link.href} className={footerLinkClassName}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-border/80 bg-white text-brand-primary">
      {children}
    </span>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 015 6a2 2 0 012-2z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l8 5 8-5" />
    </svg>
  );
}
