import { CustomCakeBuilderAnimated } from "@/components/animation/CustomCakeBuilderAnimated";
import { SafeImage } from "@/components/ui/SafeImage";
import { siteImages } from "@/lib/images";

export function CustomCakeBuilder() {
  return (
    <section
      id="custom-cakes"
      className="section-anchor relative min-h-[28rem] overflow-hidden bg-[#FFF8F9] sm:min-h-[34rem] lg:min-h-[40rem] xl:min-h-[44rem]"
      aria-labelledby="custom-cakes-heading"
    >
      {/* Full-bleed image — text overlays this plane */}
      <div className="absolute inset-0" aria-hidden>
        <SafeImage
          src={siteImages.customCake}
          fallbackSrc={siteImages.customCakeFallback}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-[62%_center]"
        />
        {/* Soft left wash for readable overlay — no harsh black panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/55 to-transparent sm:from-white/82 sm:via-white/40 sm:to-transparent lg:from-white/78 lg:via-white/28 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8F9]/70 via-transparent to-white/20 sm:from-[#FFF8F9]/40 lg:from-transparent" />
      </div>

      <CustomCakeBuilderAnimated />
    </section>
  );
}
