import { Reveal } from "@/components/animation/Reveal";
import { capStaggerDelay } from "@/lib/animation/constants";
import { features } from "@/lib/features";
import { cn } from "@/lib/cn";

export function FeatureStrip() {
  return (
    <section
      id="about"
      className="section-anchor border-y border-brand-border/40 bg-brand-pink-lighter"
      aria-labelledby="about-heading"
    >
      <h2 id="about-heading" className="sr-only">
        About DoughArt
      </h2>
      <div className="section-container">
        <ul
          className={cn(
            "grid grid-cols-1 divide-y divide-brand-border/50",
            "sm:grid-cols-3 sm:divide-x sm:divide-y-0",
          )}
        >
          {features.map((feature, index) => (
            <li key={feature.id} className="min-w-0">
              <Reveal
                delay={capStaggerDelay(index, 0.06)}
                direction="up"
                variant="text"
                className="h-full"
              >
                <div
                  className={cn(
                    "flex h-full items-start gap-2.5 px-1 py-3",
                    "sm:px-4 sm:py-3.5",
                    "lg:px-5 lg:py-4",
                  )}
                >
                  <FeatureIcon name={feature.icon} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xs font-semibold leading-snug text-brand-brown sm:text-sm">
                      {feature.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-[0.6875rem] leading-snug text-brand-muted sm:text-xs">
                      {feature.description}
                    </p>
                  </div>
                </div>
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
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
    "border border-brand-border/60 bg-white text-brand-primary",
  );
  const iconClass = "h-3.5 w-3.5";

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
