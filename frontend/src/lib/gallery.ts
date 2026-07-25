import { contactInfo } from "@/lib/contact";
import { siteImages } from "@/lib/images";

export const galleryCopy = {
  subtitle: "Follow Us On Instagram",
  heading: "A Little Happiness In Every Slice",
  instagramLabel: "Follow on Instagram",
  instagramHref: contactInfo.social.instagram,
} as const;

export const galleryImages = [
  {
    id: "gallery-1",
    alt: "Elegant wedding tiered cake",
    src: siteImages.gallery[0],
  },
  {
    id: "gallery-2",
    alt: "Colourful birthday cake with candles",
    src: siteImages.gallery[1],
  },
  {
    id: "gallery-3",
    alt: "Beautiful custom decorated cake",
    src: siteImages.gallery[2],
  },
  {
    id: "gallery-4",
    alt: "Romantic anniversary cake",
    src: siteImages.gallery[3],
  },
  {
    id: "gallery-5",
    alt: "Assorted custom cake collection",
    src: siteImages.gallery[4],
  },
] as const;
