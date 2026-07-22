import Link from "next/link";
import { CategoryCardImage } from "@/components/sections/CategoryCardImage";
import { SectionAnimatedHeader } from "@/components/animation/SectionAnimatedHeader";
import { Reveal } from "@/components/animation/Reveal";
import { capStaggerDelay } from "@/lib/animation/constants";
import { getHomepageCategories, type HomepageCategory } from "@/lib/categories";
import { cn } from "@/lib/cn";

const categoryCardImageClassName =
  "relative h-[8.125rem] w-full shrink-0 overflow-hidden bg-brand-pink-lighter sm:h-[9.375rem] lg:h-[11.25rem]";

export async function CakeCategories() {
  const categories = await getHomepageCategories();

  return (
    <section
      id="cakes"
      className="section-anchor scroll-mt-20 bg-gradient-to-b from-brand-pink-lighter/60 via-brand-cream to-brand-pink-lighter/40 py-8 sm:py-10 lg:scroll-mt-24 lg:py-11"
      aria-labelledby="cakes-heading"
    >
      <div className="section-container">
        <SectionAnimatedHeader
          eyebrow="Our Cakes"
          title="Explore Our Delicious Creations"
          description="Cakes crafted for life's sweetest moments — each category made to order with premium ingredients."
          titleAs="h2"
          titleId="cakes-heading"
          align="center"
          className="max-w-xl"
        />

        <ul
          className={cn(
            "mt-6 -mx-4 flex gap-3 overflow-x-auto px-4 pb-1",
            "snap-x snap-mandatory scroll-smooth",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0",
          )}
        >
          {categories.map((category, index) => (
            <li
              key={category.id}
              className={cn(
                "w-[10.75rem] min-w-[10.75rem] shrink-0 snap-center",
                "sm:w-[11.25rem] sm:min-w-[11.25rem]",
                "lg:w-full lg:min-w-0",
              )}
            >
              <Reveal delay={capStaggerDelay(index, 0.1)} direction="up" variant="card">
                <CategoryCard category={category} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type CategoryCardProps = {
  category: HomepageCategory;
};

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article
      className={cn(
        "group category-hover-lift flex h-full flex-col overflow-hidden rounded-xl",
        "border border-brand-border/70 bg-white",
        "shadow-sm shadow-brand-primary/8",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:shadow-md hover:shadow-brand-primary/15",
      )}
    >
      <Link href={category.href} className="flex h-full flex-col">
        <div className={cn(categoryCardImageClassName, "image-zoom-wrap")}>
          <CategoryCardImage
            apiImage={category.apiImage}
            fallbackSrc={category.imageFallback}
            alt={category.title}
            sizes="(max-width: 1024px) 11rem, 18vw"
          />
        </div>

        <div className="flex flex-col items-center px-2.5 pb-3 pt-2.5 text-center">
          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-brand-brown">
            {category.title}
          </h3>

          <span
            className={cn(
              "mt-2 inline-flex h-7 shrink-0 items-center justify-center rounded-full",
              "border border-brand-border bg-brand-pink-lighter px-3.5",
              "text-[0.6875rem] font-semibold text-brand-primary",
              "transition-colors duration-300",
              "group-hover:border-brand-primary group-hover:bg-brand-primary group-hover:text-white",
            )}
          >
            View More
          </span>
        </div>
      </Link>
    </article>
  );
}
