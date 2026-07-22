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

function CustomCakeHeading({
  id,
  compact = false,
}: {
  id?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <>
        <WordReveal
          text={customCakeCopy.subtitle}
          as="p"
          delay={0}
          className="mb-2 font-script text-[0.6875rem] font-semibold leading-snug text-brand-button-hover min-[375px]:mb-2.5 min-[375px]:text-xs min-[390px]:text-sm"
          wordClassName="font-script"
        />
        <h2
          id={id}
          className="font-display text-[0.625rem] font-bold leading-[1.25] tracking-tight text-brand-brown sm:text-[0.6875rem] min-[390px]:text-xs"
        >
          <WordReveal
            text={customCakeCopy.headingLine1}
            as="span"
            delay={0.1}
            className="block w-full"
          />
          <span className="mt-0.5 flex items-center gap-0.5 text-brand-primary">
            <WordReveal
              text={customCakeCopy.headingLine2}
              as="span"
              delay={0.22}
              className="inline-flex"
              wordClassName="text-brand-primary"
            />
            <HeartIcon className="h-2.5 w-2.5 shrink-0 min-[390px]:h-3 min-[390px]:w-3" />
          </span>
        </h2>
      </>
    );
  }

  return (
    <>
      <Reveal direction="left" delay={0}>
        <SectionEyebrow align="start">{customCakeCopy.subtitle}</SectionEyebrow>
      </Reveal>
      <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-brand-brown">
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
          <HeartIcon className="h-4 w-4" />
        </span>
      </h2>
    </>
  );
}

export function CustomCakeBuilderAnimated() {
  return (
    <>
      <div className="section-container relative z-10 px-2.5 py-8 sm:px-4 sm:py-9 lg:hidden">
        <div
          className={cn(
            "grid w-full items-center gap-y-0",
            "grid-cols-[minmax(0,0.88fr)_minmax(5.25rem,7rem)_minmax(0,0.88fr)] gap-x-2",
            "min-[375px]:grid-cols-[minmax(0,0.9fr)_minmax(6.25rem,8rem)_minmax(0,0.9fr)] min-[375px]:gap-x-3",
            "min-[390px]:grid-cols-[minmax(0,0.9fr)_minmax(6.75rem,8.25rem)_minmax(0,0.9fr)] min-[390px]:gap-x-4",
            "min-[430px]:grid-cols-[minmax(0,0.92fr)_minmax(7rem,8.5rem)_minmax(0,0.92fr)]",
          )}
        >
          <Reveal direction="left" className="relative min-w-0 justify-self-start self-center pt-5 text-left min-[375px]:pt-6 min-[390px]:pt-6">
            <CustomCakeHeading id="custom-cakes-heading" compact />
            <Reveal direction="up" delay={0.35}>
              <Button
                href={customCakeCopy.ctaHref}
                size="sm"
                className="mt-2.5 h-[1.625rem] min-w-0 max-w-full whitespace-nowrap px-2.5 text-[0.5625rem] shadow-md shadow-brand-primary/25 sm:mt-3 sm:px-3 min-[390px]:h-7 min-[390px]:text-[0.625rem]"
              >
                {customCakeCopy.ctaLabel}
              </Button>
            </Reveal>
          </Reveal>

          <Reveal delay={0.2} direction="scale" className="relative z-[5] flex items-end justify-center self-center px-0">
            <SafeImage
              src={siteImages.customCakeMobile}
              fallbackSrc={siteImages.customCakeFallback}
              alt=""
              width={220}
              height={300}
              className="h-[9.75rem] w-auto max-w-[140%] object-contain object-bottom min-[375px]:h-[11.25rem] min-[390px]:h-[11.75rem] min-[390px]:max-w-[154%] min-[430px]:h-[12.25rem] min-[430px]:max-w-[154%]"
              sizes="(max-width: 1023px) 220px"
            />
          </Reveal>

          <Reveal direction="right" delay={0.15} className="justify-self-end self-center pt-4 min-[375px]:pt-5">
            <AnimatedCustomCakeSteps compact />
          </Reveal>
        </div>
      </div>

      <div className="section-container relative z-10 hidden py-10 sm:py-12 lg:flex lg:min-h-[42rem] lg:items-center lg:py-14 xl:min-h-[44rem]">
        <div
          className={cn(
            "grid w-full items-start gap-8",
            "lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,16rem)]",
            "xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_minmax(0,17rem)] xl:gap-10",
          )}
        >
          <Reveal direction="left" className="relative z-10 min-w-0 self-start">
            <CustomCakeHeading />
            <Reveal direction="up" delay={0.35}>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-muted">
                {customCakeCopy.description}
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.5}>
              <Button
                href={customCakeCopy.ctaHref}
                size="sm"
                className="mt-5 h-9 w-fit text-sm shadow-md shadow-brand-primary/25"
              >
                {customCakeCopy.ctaLabel}
              </Button>
            </Reveal>
          </Reveal>

          <div className="hidden lg:block" aria-hidden />

          <Reveal direction="right" delay={0.15} className="relative z-10 justify-self-end">
            <AnimatedCustomCakeSteps />
          </Reveal>
        </div>
      </div>
    </>
  );
}
