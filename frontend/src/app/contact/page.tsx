import type { Metadata } from "next";
import { Reveal } from "@/components/animation/Reveal";
import { SectionAnimatedHeader } from "@/components/animation/SectionAnimatedHeader";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";
import { ContactPageContent } from "@/components/sections/ContactPageContent";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact DoughArt for custom cake orders — phone, WhatsApp, email, and enquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PublicPageLayout mainId="contact-page" ariaLabel="Contact DoughArt">
      <section className="section-padding bg-gradient-to-b from-brand-pink-lighter via-white to-brand-cream">
        <div className="section-container max-w-5xl">
          <SectionAnimatedHeader
            eyebrow="We are here for you"
            title="Contact DoughArt"
            titleAs="h1"
            align="center"
            className="max-w-xl"
            titleClassName="text-3xl sm:text-4xl"
          />
          <Reveal direction="up" delay={0.35} className="mt-10">
            <ContactPageContent />
          </Reveal>
        </div>
      </section>
    </PublicPageLayout>
  );
}
