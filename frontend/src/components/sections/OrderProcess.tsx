import { Reveal } from "@/components/animation/Reveal";
import { SafeImage } from "@/components/ui/SafeImage";
import { capStaggerDelay } from "@/lib/animation/constants";
import { cn } from "@/lib/cn";
import { siteImages } from "@/lib/images";
import { whyChooseBenefits, whyChooseCopy } from "@/lib/orderProcess";

export function OrderProcess() {
  return (
    <section
      id="order"
      className="section-anchor relative min-h-[28rem] overflow-hidden bg-[#FBE4E8] sm:min-h-[32rem] lg:min-h-[36rem] xl:min-h-[40rem]"
      aria-labelledby="order-heading"
    >
      <div className="absolute inset-0" aria-hidden>
        <SafeImage
          src={siteImages.process}
          fallbackSrc={siteImages.process}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[78%_center] opacity-100 sm:object-[72%_center] lg:object-right"
        />
      </div>

      <div
        className={cn(
          "section-container relative z-10 flex min-h-[28rem] items-center",
          "py-10 sm:min-h-[32rem] sm:py-12",
          "lg:min-h-[36rem] lg:py-14 xl:min-h-[40rem] xl:py-16",
        )}
      >
        <div className="relative min-w-0 max-w-[17rem] sm:max-w-sm md:max-w-md lg:max-w-[28rem] xl:max-w-[30rem]">
          <Reveal direction="left" delay={0}>
            <h2
              id="order-heading"
              className="font-display text-2xl font-bold leading-tight tracking-tight text-brand-brown sm:text-3xl lg:text-[2.125rem]"
            >
              {whyChooseCopy.heading}
            </h2>
          </Reveal>

          <ul className="mt-6 space-y-4 sm:mt-7 sm:space-y-5 lg:mt-8">
            {whyChooseBenefits.map((benefit, index) => (
              <Reveal
                key={benefit.title}
                as="li"
                delay={capStaggerDelay(index, 0.08, 0.45)}
                direction="up"
                className="flex min-w-0 gap-3"
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[0.6875rem] font-bold text-white sm:h-8 sm:w-8 sm:text-xs"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="font-display text-sm font-bold leading-snug text-brand-brown sm:text-base">
                    {benefit.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium leading-snug text-brand-brown/80 sm:text-sm sm:leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
