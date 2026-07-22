"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

type PopularItemsCarouselProps = {
  children: React.ReactNode;
  className?: string;
};

export function PopularItemsCarousel({
  children,
  className,
}: PopularItemsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: "prev" | "next") => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    const amount = Math.max(240, Math.floor(node.clientWidth * 0.8));
    node.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden items-center lg:flex">
        <button
          type="button"
          aria-label="Scroll popular items left"
          onClick={() => scrollByCard("prev")}
          className="pointer-events-auto ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-brand-border/70 bg-white/95 text-brand-brown shadow-sm transition hover:border-brand-primary hover:text-brand-primary"
        >
          ‹
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden items-center lg:flex">
        <button
          type="button"
          aria-label="Scroll popular items right"
          onClick={() => scrollByCard("next")}
          className="pointer-events-auto mr-1 flex h-10 w-10 items-center justify-center rounded-full border border-brand-border/70 bg-white/95 text-brand-brown shadow-sm transition hover:border-brand-primary hover:text-brand-primary"
        >
          ›
        </button>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "-mx-4 flex gap-3 overflow-x-auto px-4 pb-2",
          "snap-x snap-mandatory scroll-smooth",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "sm:gap-4",
          "lg:mx-0 lg:gap-5 lg:px-12",
        )}
      >
        {children}
      </div>
    </div>
  );
}
