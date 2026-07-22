import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { FooterCakeImage } from "@/components/layout/FooterCakeImage";
import { SocialIcon } from "@/components/icons/SocialIcon";
import {
  customerCareLinks,
  footerCopy,
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
  TikTok: "tiktok",
  WhatsApp: "whatsapp",
} as const;

const socialIconClassName =
  "flex h-10 w-10 items-center justify-center rounded-full border border-brand-pink-light/90 bg-white text-brand-primary shadow-sm shadow-brand-primary/12 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-md hover:shadow-brand-primary/25";

const footerSocialLinks = [
  ...socialLinks,
  {
    label: "WhatsApp" as const,
    href: buildWhatsAppUrl("Hello! I would like to know more about your cakes."),
  },
];

/** Aligns link columns with brand name line (below logo) on desktop only */
const navColumnOffsetClassName = "max-lg:pt-0 lg:pt-10";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className={cn(
        "section-anchor relative overflow-hidden border-t border-brand-border/40 bg-[#FFF1F4] text-brand-brown",
        "[&_.footer-surface_h3]:bg-transparent [&_.footer-surface_p]:bg-transparent",
        "[&_.footer-surface_.footer-brand-text]:bg-transparent",
        "[&_.footer-surface_.footer-nav-link]:bg-transparent [&_.footer-surface_.footer-nav-link]:shadow-none",
        "[&_.footer-surface_*::selection]:bg-brand-brown/15 [&_.footer-surface_*::selection]:text-brand-brown",
      )}
      aria-label="Site footer"
    >
      <div className="section-container footer-surface relative pb-4 pt-7 sm:pb-6 sm:pt-9 lg:pb-10 lg:pt-10">
        <div
          className={cn(
            "grid items-start",
            "grid-cols-2 gap-x-5 gap-y-4",
            "min-[375px]:gap-x-6",
            "lg:grid-cols-4 lg:gap-x-8 lg:gap-y-8",
          )}
        >
          {/* Brand — full width on mobile */}
          <Reveal direction="up" delay={0} className="col-span-2 lg:col-span-1">
          <div>
            <Link
              href="/"
              className="footer-brand-link group inline-flex items-center gap-3.5 bg-transparent transition-opacity hover:opacity-90"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-brand-border/80 bg-white shadow-sm shadow-black/5 transition-shadow group-hover:shadow-md group-hover:shadow-black/10 sm:h-14 sm:w-14">
                <Image
                  src={siteImages.logo}
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="min-w-0 bg-transparent">
                <span className="footer-brand-text font-display text-xl font-bold leading-[1.15] tracking-tight text-brand-primary sm:text-2xl">
                  {siteConfig.name}
                </span>
                <span className="footer-brand-text mt-1.5 block text-[0.75rem] font-semibold uppercase tracking-[0.24em] text-brand-muted/90 sm:text-xs">
                  {siteConfig.tagline}
                </span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs bg-transparent text-sm leading-relaxed text-brand-muted/95 lg:mt-4">
              {footerCopy.description}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2 lg:mt-5 lg:gap-2.5" aria-label="Social media">
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
                      <SocialIcon name={iconName} className="h-[1.125rem] w-[1.125rem]" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          </Reveal>

          {/* Quick Links — left on mobile */}
          <Reveal direction="up" delay={0.1} className={cn("min-w-0", navColumnOffsetClassName)}>
          <div className="min-w-0">
            <FooterColumn title="Quick Links" links={quickLinks} compact />
          </div>
          </Reveal>

          {/* Customer Care — right on mobile */}
          <Reveal direction="up" delay={0.2} className={cn("min-w-0", navColumnOffsetClassName)}>
          <div className="min-w-0">
            <FooterColumn title="Customer Care" links={customerCareLinks} compact />
          </div>
          </Reveal>

          {/* Contact Us + cake — mobile row; desktop column */}
          <Reveal
            direction="up"
            delay={0.3}
            className={cn(
              "relative col-span-2 min-w-0 lg:col-span-1 lg:min-w-[11.5rem]",
              navColumnOffsetClassName,
            )}
          >
          <div
            className={cn(
              "relative col-span-2 min-w-0 lg:col-span-1 lg:min-w-[11.5rem]",
            )}
          >
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 sm:gap-x-3 lg:block lg:max-w-[17.5rem] xl:max-w-[19rem]">
              <div className="min-w-0">
                <h3 className="bg-transparent font-display text-sm font-semibold tracking-tight text-brand-brown sm:text-base">
                  Contact Us
                </h3>
                <ul className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3 lg:space-y-3.5">
                  <li className="flex items-start gap-2.5 sm:gap-3.5">
                    <ContactIconWrap compact>
                      <LocationIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </ContactIconWrap>
                    <span className="footer-brand-text flex-1 bg-transparent pt-1 text-xs leading-relaxed text-brand-muted sm:pt-1.5 sm:text-sm">
                      {siteConfig.address}
                    </span>
                  </li>
                  <li>
                    <a
                      href={siteConfig.phoneHref}
                      className="group/contact flex items-center gap-2.5 bg-transparent transition-colors hover:bg-transparent hover:text-brand-primary sm:gap-3.5"
                    >
                      <ContactIconWrap compact>
                        <PhoneIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </ContactIconWrap>
                      <span className="footer-brand-text flex-1 whitespace-nowrap bg-transparent text-xs text-brand-muted transition-colors group-hover/contact:text-brand-primary sm:text-sm">
                        {siteConfig.phone}
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={footerCopy.emailHref}
                      className="group/contact flex items-center gap-2.5 bg-transparent transition-colors hover:bg-transparent hover:text-brand-primary sm:gap-3.5"
                    >
                      <ContactIconWrap compact>
                        <EmailIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </ContactIconWrap>
                      <span className="footer-brand-text flex-1 bg-transparent text-xs leading-snug text-brand-muted transition-colors group-hover/contact:text-brand-primary sm:text-sm">
                        {footerCopy.email}
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
              <FooterCakeImage className="mb-0.5 shrink-0 lg:hidden" />
            </div>
          </div>
          </Reveal>
        </div>
      </div>

      {/* Desktop cake — above copyright bar */}
      <div className="section-container relative z-[5] hidden h-0 overflow-visible lg:block">
        <FooterCakeImage className="absolute bottom-3 right-6" />
      </div>

      <Reveal direction="up" delay={0.4}>
      <div className="relative z-10 bg-brand-button-hover text-white">
        <div
          className={cn(
            "section-container flex gap-2 py-2.5 text-[0.625rem] leading-snug",
            "max-[359px]:flex-col max-[359px]:items-start max-[359px]:gap-1",
            "min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between",
            "sm:py-3 sm:text-xs",
          )}
        >
          <p className="shrink-0 text-white/95">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="italic text-white/85 max-[359px]:text-[0.6rem] sm:text-right">
            {siteConfig.slogan}
          </p>
        </div>
      </div>
      </Reveal>
    </footer>
  );
}

function ContactIconWrap({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-brand-pink-light/90 bg-gradient-to-b from-white to-brand-pink-lighter/80 text-brand-primary shadow-sm",
        compact ? "h-8 w-8" : "h-9 w-9",
      )}
    >
      {children}
    </span>
  );
}

type FooterColumnProps = {
  title: string;
  links: readonly { label: string; href: string }[];
  compact?: boolean;
};

function FooterColumn({ title, links, compact = false }: FooterColumnProps) {
  return (
    <div className="min-w-0">
      <h3
        className={cn(
          "bg-transparent font-display font-semibold tracking-tight text-brand-brown",
          compact ? "text-sm" : "text-base",
        )}
      >
        {title}
      </h3>
      <ul className={cn(compact ? "mt-2.5 space-y-2" : "mt-4 space-y-2.5")}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "footer-nav-link bg-transparent text-brand-muted shadow-none transition-colors hover:bg-transparent hover:text-brand-primary",
                compact ? "text-xs sm:text-sm" : "text-sm",
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
