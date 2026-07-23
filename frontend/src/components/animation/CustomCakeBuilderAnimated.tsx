"use client";

import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/animation/Reveal";
import { WordReveal } from "@/components/animation/WordReveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { customCakeCopy } from "@/lib/customCake";
import { cn } from "@/lib/cn";

export function CustomCakeBuilderAnimated() {
  return (
    <div
      className={cn(
        "section-container relative z-10 flex min-h-[28rem] items-center",
        "py-12 sm:min-h-[34rem] sm:py-14",
        "lg:min-h-[40rem] lg:py-16 xl:min-h-[44rem] xl:py-20",
      )}
    >
      {/* Text directly over the image — left side; no steps, panel, or overlay wash */}
      <div
        className={cn(
          "relative min-w-0 max-w-[17.5rem]",
          "sm:max-w-sm md:max-w-md",
          "lg:max-w-lg",
        )}
      >
        <Reveal direction="left" delay={0}>
          <SectionEyebrow align="start">{customCakeCopy.subtitle}</SectionEyebrow>
        </Reveal>

        <h2
          id="custom-cakes-heading"
          className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-brand-brown sm:mt-3.5 sm:text-3xl lg:mt-4 lg:text-[2.125rem]"
        >
          <WordReveal
            text={customCakeCopy.heading}
            as="span"
            delay={0.1}
            className="block w-full"
          />
        </h2>

        <Reveal direction="up" delay={0.3}>
          <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-brand-brown sm:mt-5 sm:text-[0.9375rem] lg:mt-6 lg:text-base">
            {customCakeCopy.description}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.45}>
          <Button
            href={customCakeCopy.ctaHref}
            size="sm"
            className="mt-7 h-9 w-fit text-sm sm:mt-8 sm:h-10 sm:px-5 lg:mt-10"
          >
            {customCakeCopy.ctaLabel}
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
