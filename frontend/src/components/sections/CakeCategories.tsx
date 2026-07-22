import Link from "next/link";
import { CategoryCardImage } from "@/components/sections/CategoryCardImage";
import { SectionAnimatedHeader } from "@/components/animation/SectionAnimatedHeader";
import { Reveal } from "@/components/animation/Reveal";
import { capStaggerDelay } from "@/lib/animation/constants";
import { getHomepageCategories, type HomepageCategory } from "@/lib/categories";
import { cn } from "@/lib/cn";

const categoryCircleClassName = cn(
  "image-zoom-wrap relative aspect-square w-full overflow-hidden rounded-full",
  "bg-brand-pink-lighter",
  "ring-1 ring-brand-border/60",
  "shadow-sm shadow-brand-primary/10",
  "transition-all duration-300 ease-out",
  "group-hover:scale-[1.04] group-hover:shadow-md group-hover:shadow-brand-primary/20 group-hover:ring-brand-primary/35",
);

export async function CakeCategories() {
  const categories = await getHomepageCategories();

  return (
    <section
      id="cakes"
      className="section-anchor scroll-mt-20 bg-white py-8 sm:py-10 lg:scroll-mt-24 lg:py-11"
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
            "mt-8 -mx-4 flex flex-nowrap gap-5 overflow-x-auto px-4 pb-2",
            "snap-x snap-mandatory scroll-smooth",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "sm:gap-6",
            "lg:mx-0 lg:gap-8 lg:px-0",
          )}
        >
          {categories.map((category, index) => (
            <li
              key={category.id}
              className={cn(
                "w-[7.5rem] min-w-[7.5rem] shrink-0 snap-center",
                "sm:w-[8.5rem] sm:min-w-[8.5rem]",
                "lg:w-[11rem] lg:min-w-[11rem]",
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
    <article className="group h-full">
      <Link
        href={category.href}
        className="flex h-full flex-col items-center gap-3 text-center outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-brand-primary/50"
      >
        <div className={categoryCircleClassName}>
          <CategoryCardImage
            apiImage={category.apiImage}
            fallbackSrc={category.imageFallback}
            alt={category.title}
            sizes="(max-width: 1024px) 8.5rem, 11rem"
          />
        </div>

        <h3 className="line-clamp-2 max-w-[9.5rem] font-display text-sm font-semibold leading-snug text-brand-brown transition-colors duration-300 group-hover:text-brand-primary sm:text-[0.9375rem]">
          {category.title}
        </h3>
      </Link>
    </article>
  );
}
