"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animation/Reveal";
import { cn } from "@/lib/cn";

const heroBtnClass =
  "shadow-[0_4px_14px_rgba(231,84,128,0.28)] hover:shadow-[0_8px_22px_rgba(231,84,128,0.42)]";

/** Staggered mount delays for the ~5s hero text sequence */
const HERO_TEXT_DELAYS = {
  eyebrow: 0,
  heading: 0.8,
  description: 1.6,
  buttons: 2.4,
} as const;

type HeroContentProps = {
  eyebrow: string;
  headline: string;
  description: string;
};

export function HeroContent({ eyebrow, headline, description }: HeroContentProps) {
  return (
    <div
      className={cn(
        "max-w-[11.25rem] sm:max-w-[12.75rem]",
        "lg:max-w-2xl",
      )}
    >
      <Reveal
        mount
        delay={HERO_TEXT_DELAYS.eyebrow}
        variant="hero-text"
        as="p"
        className={cn(
          "w-full max-lg:text-[1.125rem] max-lg:font-semibold",
          "font-script italic text-brand-primary",
          "text-brand-button-hover",
          "lg:text-2xl lg:font-normal lg:text-brand-primary",
          "xl:text-3xl",
        )}
      >
        {eyebrow}
      </Reveal>

      <Reveal
        mount
        delay={HERO_TEXT_DELAYS.heading}
        variant="hero-text"
        as="h1"
        id="hero-heading"
        className={cn(
          "mt-3 block w-full font-display font-bold leading-[1.18] tracking-tight text-balance text-brand-brown",
          "text-[1.125rem] sm:mt-3.5 sm:text-[1.25rem]",
          "lg:mt-4 lg:text-4xl lg:leading-tight",
          "xl:text-5xl",
        )}
      >
        {headline}
      </Reveal>

      <Reveal
        mount
        delay={HERO_TEXT_DELAYS.description}
        variant="hero-text"
        className="mt-4 hidden max-w-lg lg:block"
      >
        <p className="text-base leading-relaxed text-brand-muted lg:text-xl">
          {description}
        </p>
      </Reveal>

      <Reveal
        mount
        delay={HERO_TEXT_DELAYS.buttons}
        variant="hero-text"
        className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 lg:mt-7 lg:gap-2.5"
      >
        <Button
          href="/custom-cake"
          size="sm"
          className={cn(
            "h-7 min-w-0 px-3 text-[0.625rem] font-semibold sm:h-8 sm:px-3.5 sm:text-[0.6875rem]",
            "lg:h-10 lg:min-w-[8rem] lg:px-5 lg:text-sm",
            heroBtnClass,
          )}
        >
          Order Custom Cake
        </Button>
        <Button
          href="/cakes/all"
          variant="outline"
          size="sm"
          className={cn(
            "h-7 min-w-0 border-brand-primary/85 bg-white/75 px-3 text-[0.625rem] text-brand-primary backdrop-blur-[1px]",
            "sm:h-8 sm:px-3.5 sm:text-[0.6875rem]",
            "lg:h-10 lg:min-w-[8rem] lg:px-5 lg:text-sm lg:bg-transparent",
            heroBtnClass,
          )}
        >
          Browse Cakes
        </Button>
      </Reveal>
    </div>
  );
}
