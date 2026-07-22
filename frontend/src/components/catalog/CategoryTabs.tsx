"use client";

import Link from "next/link";
import { Reveal } from "@/components/animation/Reveal";
import { capStaggerDelay } from "@/lib/animation/constants";
import { cn } from "@/lib/cn";
import type { PublicCategory } from "@/lib/catalog";

const ALL_SLUG = "all";

type CategoryTabsProps = {
  categories: PublicCategory[];
  activeSlug: string;
};

type TabItemProps = {
  slug: string;
  label: string;
  activeSlug: string;
  delay: number;
};

function CategoryTab({ slug, label, activeSlug, delay }: TabItemProps) {
  const isActive = slug === activeSlug;

  return (
    <Reveal delay={delay} direction="up" variant="text">
      <Link
        href={`/cakes/${slug}`}
        className={cn(
          "inline-flex h-8 shrink-0 items-center justify-center rounded-full px-3.5 text-xs font-semibold tracking-wide transition-all duration-300 sm:h-9 sm:px-4 sm:text-sm",
          "hover:-translate-y-0.5",
          isActive
            ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30 ring-1 ring-brand-primary/15"
            : "border border-brand-border/80 bg-white text-brand-brown shadow-sm hover:border-brand-primary/40 hover:bg-brand-pink-lighter hover:text-brand-primary hover:shadow-md hover:shadow-brand-primary/10",
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    </Reveal>
  );
}

export function CategoryTabs({ categories, activeSlug }: CategoryTabsProps) {
  return (
    <nav
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 scroll-smooth",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-2.5",
      )}
      aria-label="Filter by category"
    >
      <CategoryTab slug={ALL_SLUG} label="All Cakes" activeSlug={activeSlug} delay={0} />
      {categories.map((category, index) => (
        <CategoryTab
          key={category._id}
          slug={category.slug}
          label={category.name}
          activeSlug={activeSlug}
          delay={capStaggerDelay(index + 1, 0.08)}
        />
      ))}
    </nav>
  );
}
