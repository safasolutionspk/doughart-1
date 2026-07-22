import Link from "next/link";
import { SocialIcon } from "@/components/icons/SocialIcon";
import { externalLinkProps, isExternalHref } from "@/lib/links";
import { siteConfig, socialLinks } from "@/lib/site";

const socialIconMap = {
  Facebook: "facebook",
  Instagram: "instagram",
  TikTok: "tiktok",
} as const;

export function TopBar() {
  return (
    <header
      className="border-b border-brand-border/60 bg-brand-pink-lighter text-brand-muted"
      aria-label="Contact and social links"
    >
      <div className="section-container flex flex-col gap-1.5 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:py-2 sm:text-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <span className="flex items-center gap-1.5">
            <LocationIcon className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
            <span className="truncate">{siteConfig.address}</span>
          </span>
          <span className="hidden h-3 w-px bg-brand-border sm:block" aria-hidden />
          <span className="hidden font-medium italic text-brand-primary sm:inline">
            {siteConfig.slogan}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="font-medium italic text-brand-primary sm:hidden">
            {siteConfig.slogan}
          </p>
          <div className="flex items-center gap-3">
            <a
              href={siteConfig.phoneHref}
              className="flex items-center gap-1.5 font-semibold whitespace-nowrap text-brand-brown transition-colors hover:text-brand-primary"
            >
              <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
              {siteConfig.phone}
            </a>
            <span className="h-3 w-px bg-brand-border" aria-hidden />
            <ul className="flex items-center gap-1.5" aria-label="Social media">
              {socialLinks.map((social) => {
                const iconName =
                  socialIconMap[social.label as keyof typeof socialIconMap];
                return (
                  <li key={social.label}>
                    <Link
                      href={social.href}
                      aria-label={`${social.label} (opens in new tab)`}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-brand-primary transition-colors duration-200 hover:bg-brand-primary hover:text-white"
                      {...(isExternalHref(social.href) ? externalLinkProps : {})}
                    >
                      <SocialIcon name={iconName} className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </header>
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
