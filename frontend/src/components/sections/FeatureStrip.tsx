import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/animation/Reveal";
import { capStaggerDelay } from "@/lib/animation/constants";
import { features } from "@/lib/features";
import { cn } from "@/lib/cn";

export function FeatureStrip() {
  return (
    <section
      id="about"
      className="section-anchor overflow-hidden border-y border-brand-border/40 bg-white/80 py-4 sm:section-padding"
      aria-labelledby="about-heading"
    >
      <h2 id="about-heading" className="sr-only">
        About DoughArt
      </h2>
      <div className="section-container min-w-0 overflow-hidden">
        <ul
          className={cn(
            "snap-carousel items-stretch",
            "sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0",
          )}
        >
          {features.map((feature, index) => (
            <li
              key={feature.id}
              className={cn(
                "snap-carousel-item flex shrink-0 snap-center",
                "w-[13.75rem] min-w-[13.125rem] max-w-[15rem]",
                "sm:w-full sm:min-w-0 sm:max-w-none",
              )}
            >
              <Reveal delay={capStaggerDelay(index, 0.1)} direction="up" variant="card" className="h-full w-full">
                <Card
                padding="none"
                className={cn(
                  "card-premium h-full w-full border-brand-border/50",
                  "bg-gradient-to-b from-white to-brand-pink-lighter/50",
                  "rounded-2xl p-3 text-center shadow-sm",
                  "sm:p-5 sm:text-left",
                )}
              >
                <div className="flex h-full flex-col items-center sm:items-start">
                  <FeatureIcon name={feature.icon} />
                  <h3
                    className={cn(
                      "mt-2 line-clamp-2 font-display text-sm font-semibold text-brand-brown",
                      "sm:mt-3 sm:text-base lg:text-lg",
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-[0.6875rem] leading-snug text-brand-muted",
                      "sm:mt-1.5 sm:line-clamp-none sm:text-xs lg:text-sm",
                    )}
                  >
                    {feature.description}
                  </p>
                </div>
              </Card>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type FeatureIconName = (typeof features)[number]["icon"];

function FeatureIcon({ name }: { name: FeatureIconName }) {
  const wrapperClass = cn(
    "category-hover-lift flex shrink-0 items-center justify-center rounded-full bg-brand-pink-light shadow-sm shadow-brand-primary/10",
    "h-8 w-8 sm:h-11 sm:w-11",
  );
  const iconClass = cn("text-brand-primary h-4 w-4 sm:h-5 sm:w-5");

  const strokeProps = {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "fresh":
      return (
        <span className={wrapperClass} aria-hidden>
          <svg className={iconClass} viewBox="0 0 24 24" {...strokeProps}>
            <path d="M12 3c-3 4-6 6-6 10a6 6 0 1012 0c0-4-3-6-6-10z" />
            <path d="M12 13v8" />
          </svg>
        </span>
      );
    case "delivery":
      return (
        <span className={wrapperClass} aria-hidden>
          <svg className={iconClass} viewBox="0 0 24 24" {...strokeProps}>
            <path d="M3 7h11v8H3V7z" />
            <path d="M14 9h4l3 3v3h-7V9z" />
            <circle cx="7" cy="17" r="1.25" />
            <circle cx="17" cy="17" r="1.25" />
          </svg>
        </span>
      );
    case "love":
      return (
        <span className={wrapperClass} aria-hidden>
          <svg className={iconClass} viewBox="0 0 24 24" {...strokeProps}>
            <path d="M12 20.5s-6-4.35-6-9.5a4.5 4.5 0 018.5-2.5A4.5 4.5 0 0118 11c0 5.15-6 9.5-6 9.5z" />
          </svg>
        </span>
      );
  }
}
