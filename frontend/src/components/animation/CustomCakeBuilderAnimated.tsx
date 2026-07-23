"use client";

import { Button } from "@/components/ui/Button";
import { AnimatedCustomCakeSteps } from "@/components/animation/AnimatedCustomCakeSteps";
import { Reveal } from "@/components/animation/Reveal";
import { WordReveal } from "@/components/animation/WordReveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { SafeImage } from "@/components/ui/SafeImage";
import { customCakeCopy } from "@/lib/customCake";
import { siteImages } from "@/lib/images";
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
    <div className="section-container relative z-10 py-10 sm:py-12 lg:py-16 xl:py-20">
      <div
        className={cn(
          "grid w-full items-center gap-8",
          "grid-cols-1",
          "md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-10",
          "lg:gap-12 xl:gap-16",
        )}
      >
        {/* Text block — left on tablet/desktop, first on mobile */}
        <div className="relative z-10 min-w-0 order-1">
          <CustomCakeHeading id="custom-cakes-heading" />

          <Reveal direction="up" delay={0.3}>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-muted sm:mt-3.5 sm:text-[0.9375rem] lg:text-base">
              {customCakeCopy.description}
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.4} className="mt-5 sm:mt-6">
            <AnimatedCustomCakeSteps />
          </Reveal>

          <Reveal direction="up" delay={0.55}>
            <Button
              href={customCakeCopy.ctaHref}
              size="sm"
              className="mt-6 h-9 w-fit text-sm shadow-md shadow-brand-primary/25 sm:mt-7 sm:h-10 sm:px-5"
            >
              {customCakeCopy.ctaLabel}
            </Button>
          </Reveal>
        </div>

        {/* Image — right on tablet/desktop, below text on mobile */}
        <Reveal
          delay={0.2}
          direction="scale"
          className="relative z-[5] order-2 flex w-full items-center justify-center md:justify-end"
        >
          <div className="relative w-full max-w-[22rem] sm:max-w-[26rem] md:max-w-none lg:max-w-[32rem]">
            <SafeImage
              src={siteImages.customCake}
              fallbackSrc={siteImages.customCakeFallback}
              alt="Custom cake design preview"
              width={640}
              height={720}
              className="mx-auto h-auto w-full object-contain object-center drop-shadow-[0_18px_40px_rgba(231,84,128,0.14)]"
              sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 512px"
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
