import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedListItem } from "@/components/animation/AnimatedListItem";
import { Reveal } from "@/components/animation/Reveal";
import { SectionAnimatedHeader } from "@/components/animation/SectionAnimatedHeader";
import { GalleryImageTile } from "@/components/gallery/GalleryImageTile";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";
import { galleryCopy, fetchPublicGalleryImages } from "@/lib/gallery";
import { cn } from "@/lib/cn";
import { externalLinkProps } from "@/lib/links";
import { realAssets } from "@/lib/realAssets";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Gallery",
  description:
    "Browse DoughArt custom cake creations — weddings, birthdays, anniversaries, and celebration favourites.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const waveBg = realAssets.galleryWaveBg;
  const images = await fetchPublicGalleryImages();

  return (
    <PublicPageLayout mainId="gallery-page" ariaLabel="Gallery">
      <section
        className={cn(
          "section-padding relative overflow-hidden",
          !waveBg && "bg-gradient-to-b from-brand-pink-lighter via-white to-brand-cream",
        )}
        style={
          waveBg
            ? {
                backgroundImage: `url(${waveBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      >
        <div className="section-container relative z-10">
          <SectionAnimatedHeader
            eyebrow={galleryCopy.subtitle}
            title={galleryCopy.heading}
            description="A glimpse of the cakes we have crafted for weddings, birthdays, and every sweet celebration in between."
            titleAs="h1"
            align="center"
            className="max-w-2xl"
            titleClassName="text-3xl sm:text-4xl"
          />
          <Reveal direction="up" delay={0.45} className="mt-5 text-center">
            <Link
              href={galleryCopy.instagramHref}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border-2 border-brand-primary bg-brand-primary px-5 py-2.5",
                "text-sm font-semibold text-white shadow-md shadow-brand-primary/35 transition-all hover:-translate-y-0.5 hover:bg-white hover:text-brand-primary",
              )}
              {...externalLinkProps}
            >
              {galleryCopy.instagramLabel}
            </Link>
          </Reveal>

          {images.length === 0 ? (
            <p className="mt-10 text-center text-sm text-brand-muted">
              Gallery photos will appear here once they are added in Admin.
            </p>
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
              {images.map((image, index) => (
                <AnimatedListItem key={image.id} index={index}>
                  <div className="card-premium image-zoom-wrap group relative aspect-square overflow-hidden rounded-2xl border border-white/90 bg-white shadow-md shadow-brand-primary/10">
                    <GalleryImageTile
                      image={image}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                      imageClassName="image-zoom-target"
                    />
                  </div>
                </AnimatedListItem>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PublicPageLayout>
  );
}
