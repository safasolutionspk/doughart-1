import { CustomCakeBuilderAnimated } from "@/components/animation/CustomCakeBuilderAnimated";
import { SafeImage } from "@/components/ui/SafeImage";
import { siteImages } from "@/lib/images";

export function CustomCakeBuilder() {
  return (
    <section
      id="custom-cakes"
      className="section-anchor relative overflow-hidden bg-gradient-to-br from-[#FFF1F4] via-[#FCE8EC] to-[#FFF8F0] lg:min-h-[42rem] lg:bg-transparent xl:min-h-[44rem]"
      aria-labelledby="custom-cakes-heading"
    >
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <SafeImage
          src={siteImages.customCake}
          fallbackSrc={siteImages.customCakeFallback}
          alt=""
          fill
          sizes="100vw"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <CustomCakeBuilderAnimated />
    </section>
  );
}
