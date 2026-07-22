import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CakeCategories } from "@/components/sections/CakeCategories";
import { CustomCakeBuilder } from "@/components/sections/CustomCakeBuilder";
import { FeatureStrip } from "@/components/sections/FeatureStrip";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Newsletter } from "@/components/sections/Newsletter";
import { OrderProcess } from "@/components/sections/OrderProcess";
import { Reviews } from "@/components/sections/Reviews";
import { siteImages } from "@/lib/images";
import { buildPageMetadata, siteUrl } from "@/lib/seo";
import { siteConfig, socialLinks } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Custom Cakes Bakery",
  description:
    "DoughArt crafts custom cakes for birthdays, weddings, and celebrations in Lahore. Browse designs, place orders online, or request a bespoke cake.",
  path: "/",
});

export default function Home() {
  const bakeryStructuredData = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: siteConfig.name,
    url: siteUrl,
    image: new URL(siteImages.hero, siteUrl).toString(),
    logo: new URL(siteImages.logo, siteUrl).toString(),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: "Lahore",
      addressCountry: "PK",
    },
    sameAs: socialLinks.map((link) => link.href),
  } as const;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bakeryStructuredData),
        }}
      />
      <Header />
      <main
        id="home"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none"
        aria-label="Page content"
      >
        <Hero />
        <FeatureStrip />
        <CakeCategories />
        <CustomCakeBuilder />
        <OrderProcess />
        <Reviews />
        <Gallery />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
