import Image from "next/image";
import { SectionAnimatedHeader } from "@/components/animation/SectionAnimatedHeader";
import { Reveal } from "@/components/animation/Reveal";
import { capStaggerDelay } from "@/lib/animation/constants";
import { orderProcessCopy, orderProcessSteps } from "@/lib/orderProcess";

export function OrderProcess() {
  return (
    <section
      id="order"
      className="section-anchor section-padding bg-brand-pink-lighter"
      aria-labelledby="order-heading"
    >
      <div className="section-container">
        <SectionAnimatedHeader
          eyebrow={orderProcessCopy.subtitle}
          title={orderProcessCopy.heading}
          titleAs="h2"
          titleId="order-heading"
          align="center"
          className="max-w-xl"
        />

        <div className="relative mt-8 sm:mt-10">
          <span
            className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-brand-primary/30 lg:block"
            aria-hidden
          />

          <ol className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {orderProcessSteps.map((step, index) => (
              <Reveal
                key={step.id}
                as="li"
                delay={capStaggerDelay(index, 0.1)}
                direction="up"
                variant="card"
                className="flex w-[68%] min-w-[9.5rem] max-w-[11.5rem] shrink-0 snap-center flex-col items-center text-center sm:w-[42%] sm:max-w-[12rem] lg:w-auto lg:max-w-none"
              >
                <OrderStep step={step} />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

type OrderStepProps = {
  step: (typeof orderProcessSteps)[number];
};

function OrderStep({ step }: OrderStepProps) {
  return (
    <>
      <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-pink-light bg-white p-2.5 shadow-lg shadow-brand-primary/10 transition-transform duration-300 hover:-translate-y-0.5 sm:h-16 sm:w-16 sm:p-3">
        <Image
          src={step.icon}
          alt=""
          width={40}
          height={40}
          className="h-8 w-8 object-contain sm:h-10 sm:w-10"
          aria-hidden
        />
      </span>

      <div className="mt-2.5 flex items-center justify-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[0.625rem] font-bold leading-none text-white">
          {step.step}
        </span>
        <h3 className="font-display text-xs font-semibold leading-snug text-brand-brown sm:text-sm">
          {step.title}
        </h3>
      </div>

      <p className="mt-1 hidden max-w-[10.5rem] text-[0.6875rem] leading-snug text-brand-muted sm:block">
        {step.description}
      </p>
    </>
  );
}
