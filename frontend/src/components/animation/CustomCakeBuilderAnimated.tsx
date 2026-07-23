"use client";

import { Button } from "@/components/ui/Button";
import { AnimatedCustomCakeSteps } from "@/components/animation/AnimatedCustomCakeSteps";
import { Reveal } from "@/components/animation/Reveal";
import { WordReveal } from "@/components/animation/WordReveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { customCakeCopy } from "@/lib/customCake";
import { cn } from "@/lib/cn";

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 14s-5.5-3.6-5.5-7.2C2.5 4.6 4.2 3 6.1 3c1.1 0 2.1.5 2.9 1.3C9.8 3.5 10.8 3 11.9 3 13.8 3 15.5 4.6 15.5 6.8 15.5 10.4 8 14 8 14z" />
    </svg>
  );
}

function CustomCakeHeading({ id }: { id?: string }) {
  return (
    <>
      <Reveal direction="left" delay={0}>
        <SectionEyebrow align="start">{customCakeCopy.subtitle}</SectionEyebrow>
      </Reveal>
      <h2
        id={id}
        className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-brand-brown sm:text-3xl lg:text-[2.125rem]"
      >
        <WordReveal
          text={customCakeCopy.headingLine1}
          as="span"
          delay={0.1}
          className="block w-full"
        />
        <span className="mt-0.5 flex items-center gap-1.5 text-brand-primary">
          <WordReveal
            text={customCakeCopy.headingLine2}
            as="span"
            delay={0.22}
            className="inline-flex"
            wordClassName="text-brand-primary"
          />
          <HeartIcon className="h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem]" />
        </span>
      </h2>
    </>
  );
}

export function CustomCakeBuilderAnimated() {
  return (
    <div
      className={cn(
        "section-container relative z-10 flex min-h-[28rem] items-center",
        "py-10 sm:min-h-[34rem] sm:py-12",
        "lg:min-h-[40rem] lg:py-16 xl:min-h-[44rem] xl:py-20",
      )}
    >
      {/* Overlay copy — left of composition; cake stays visible on the right */}
      <div
        className={cn(
          "relative min-w-0 max-w-[17.5rem]",
          "sm:max-w-sm md:max-w-md",
          "lg:max-w-lg",
          "[text-shadow:0_1px_12px_rgba(255,255,255,0.55)]",
        )}
      >
        <CustomCakeHeading id="custom-cakes-heading" />

        <Reveal direction="up" delay={0.3}>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-brown/80 sm:mt-3.5 sm:text-[0.9375rem] lg:text-base">
            {customCakeCopy.description}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.4} className="mt-4 sm:mt-5 lg:mt-6">
          <div className="sm:hidden">
            <AnimatedCustomCakeSteps compact />
          </div>
          <div className="hidden sm:block">
            <AnimatedCustomCakeSteps />
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.55}>
          <Button
            href={customCakeCopy.ctaHref}
            size="sm"
            className="mt-5 h-9 w-fit text-sm shadow-md shadow-brand-primary/25 sm:mt-6 sm:h-10 sm:px-5 lg:mt-7"
          >
            {customCakeCopy.ctaLabel}
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
