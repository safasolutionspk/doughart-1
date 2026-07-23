import type { Metadata } from "next";
import { SectionAnimatedHeader } from "@/components/animation/SectionAnimatedHeader";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";
import { ReviewsGrid } from "@/components/sections/ReviewsGrid";
import { getAllDisplayReviews, reviewsCopy } from "@/lib/reviews";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Reviews",
  description:
    "Read what DoughArt customers say about our custom cakes — real stories from weddings, birthdays, and celebrations.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const reviews = await getAllDisplayReviews();

  return (
    <PublicPageLayout mainId="reviews-page" ariaLabel="Customer reviews">
      <section className="section-padding bg-brand-pink-lighter/25">
        <div className="section-container">
          <SectionAnimatedHeader
            eyebrow={reviewsCopy.subtitle}
            title={reviewsCopy.heading}
            description={reviewsCopy.subtitle}
            titleAs="h1"
            align="center"
            className="max-w-xl"
            titleClassName="text-3xl sm:text-4xl"
          />
          <div className="mt-10">
            <ReviewsGrid reviews={reviews} />
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}
