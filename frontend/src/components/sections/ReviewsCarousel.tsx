"use client";

import { ReviewAvatar } from "@/components/sections/ReviewAvatar";
import { Reveal } from "@/components/animation/Reveal";
import { capStaggerDelay } from "@/lib/animation/constants";
import type { DisplayReview } from "@/lib/reviews";

type ReviewsCarouselProps = {
  reviews: DisplayReview[];
};

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  return (
    <ul
      className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      aria-label="Customer reviews"
    >
      {reviews.map((review, index) => (
        <Reveal
          key={review.id}
          as="li"
          delay={capStaggerDelay(index, 0.1)}
          direction="up"
          variant="card"
          className="w-[82%] min-w-[16.5rem] max-w-[20rem] shrink-0 snap-center sm:w-[48%] sm:max-w-[22rem] lg:w-auto lg:max-w-none"
        >
          <ReviewCard review={review} />
        </Reveal>
      ))}
    </ul>
  );
}

function ReviewCard({ review }: { review: DisplayReview }) {
  return (
    <article className="card-premium flex h-full min-h-[10.5rem] flex-col rounded-2xl border border-brand-border/60 bg-gradient-to-b from-white via-white to-brand-pink-lighter/40 px-4 py-4 shadow-md shadow-brand-primary/8 sm:px-5 sm:py-5">
      <div className="flex items-center gap-3">
        <ReviewAvatar avatar={review.avatar} initials={review.initials} />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-brand-brown sm:text-base">
            {review.name}
          </p>
          {review.role ? (
            <p className="truncate text-xs text-brand-muted">{review.role}</p>
          ) : null}
          <StarRating rating={review.rating} label={`${review.rating} out of 5 stars`} />
        </div>
      </div>

      <blockquote className="mt-3 flex-1 border-t border-brand-border/40 pt-3">
        <p className="text-xs leading-relaxed text-brand-muted sm:text-sm">
          &ldquo;{review.text}&rdquo;
        </p>
      </blockquote>
    </article>
  );
}

function StarRating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="mt-0.5 flex gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < rating;
        return (
          <span
            key={index}
            className={filled ? "text-amber-400" : "text-brand-border"}
            aria-hidden
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
