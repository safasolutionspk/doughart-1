import { CustomCakeBuilderAnimated } from "@/components/animation/CustomCakeBuilderAnimated";
import { SafeImage } from "@/components/ui/SafeImage";
import { siteImages } from "@/lib/images";

export function CustomCakeBuilder() {
  return (
    <section
      id="custom-cakes"
      className="section-anchor relative min-h-[28rem] overflow-hidden sm:min-h-[34rem] lg:min-h-[40rem] xl:min-h-[44rem]"
      aria-labelledby="custom-cakes-heading"
    >
      {/* Full-bleed image only — no wash, gradient, blur, or cover layer */}
      <div className="absolute inset-0" aria-hidden>
        <SafeImage
          src={siteImages.customCake}
          fallbackSrc={siteImages.customCakeFallback}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[72%_center] opacity-100 sm:object-[68%_center] lg:object-[62%_center]"
        />
      </div>

      <CustomCakeBuilderAnimated />
    </section>
  );
}
