import type { Metadata } from "next";
import { siteImages } from "@/lib/images";
import { siteConfig } from "@/lib/site";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.sweetbite.com";

const defaultTitle = `${siteConfig.name} | Custom Cakes Bakery`;
const defaultDescription =
  "Order handcrafted custom cakes for weddings, birthdays, and celebrations. DoughArt bakes premium cakes with fresh ingredients and designs made just for you.";
const defaultOgImage = siteImages.hero;

export const siteKeywords = [
  "custom cakes",
  "bakery",
  "wedding cakes",
  "birthday cakes",
  "DoughArt",
  "cake delivery",
  "celebration cakes",
  "handcrafted cakes",
] as const;

export const shopKeywords = [
  "order cakes online",
  "cake shop",
  "celebration cakes",
  "cake delivery",
] as const;

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: defaultDescription,
  keywords: [...siteKeywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name,
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

/** Build consistent SEO metadata for shop and transactional pages */
export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const pageUrl = new URL(canonicalPath, siteUrl).toString();

  return {
    title,
    description,
    keywords: keywords ? [...siteKeywords, ...keywords] : [...siteKeywords],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      ...siteMetadata.openGraph,
      title: `${title} | ${siteConfig.name}`,
      description,
      url: pageUrl,
      images: siteMetadata.openGraph?.images,
    },
    twitter: {
      ...siteMetadata.twitter,
      title: `${title} | ${siteConfig.name}`,
      description,
      images: siteMetadata.twitter?.images,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
