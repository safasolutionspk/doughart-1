import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CatalogCardImage } from "@/components/catalog/CatalogCardImage";
import {
  catalogCardActionsClassName,
  catalogCardBodyClassName,
  catalogCardContentClassName,
  catalogCardDescriptionClassName,
  catalogCardImageClassName,
  catalogCardShellClassName,
  catalogCardTitleClassName,
} from "@/lib/catalog/cardStyles";
import { cn } from "@/lib/cn";
import { formatPrice, getCategoryRef, type PublicCake } from "@/lib/catalog";
import { getCakeImageSrc } from "@/lib/media";
import { getWhatsAppNumber, buildWhatsAppOrderUrl } from "@/lib/whatsapp";

const cardButtonClassName =
  "!h-8 w-full min-w-0 !min-w-0 max-w-full truncate !px-2 !text-[10px] sm:!h-8 sm:!text-[11px]";

type CakeCardProps = {
  cake: PublicCake;
  /** When false, omits the description line (homepage popular section). Default true. */
  showDescription?: boolean;
};

export async function CakeCard({ cake, showDescription = true }: CakeCardProps) {
  const category = getCategoryRef(cake);
  const { apiImage, fallback } = getCakeImageSrc(cake.image, category.slug);
  const displayImage = apiImage ?? fallback;
  const detailHref = `/cakes/${category.slug}/${cake.slug}`;
  const orderHref = `/checkout?cake=${encodeURIComponent(cake.slug)}`;
  const waNumber = await getWhatsAppNumber();
  const whatsappHref = buildWhatsAppOrderUrl(cake.name, waNumber);

  return (
    <Card as="article" padding="none" className={catalogCardShellClassName}>
      <Link href={detailHref} className="block shrink-0">
        <div className={catalogCardImageClassName}>
          <CatalogCardImage
            apiImage={apiImage}
            fallbackSrc={fallback}
            alt={cake.name}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
          <span className="pink-overlay" aria-hidden />
        </div>
      </Link>

      <div className={catalogCardBodyClassName}>
        <div className={catalogCardContentClassName}>
          <Link href={detailHref} className="block shrink-0">
            <h3
              className={cn(
                catalogCardTitleClassName,
                "transition-colors hover:text-brand-primary",
              )}
            >
              {cake.name}
            </h3>
          </Link>
          {showDescription ? (
            <p className={catalogCardDescriptionClassName}>
              {cake.description?.trim() || "\u00a0"}
            </p>
          ) : null}
          <p className="shrink-0 pt-0.5 font-display text-xs font-semibold text-brand-primary sm:text-sm">
            {formatPrice(cake.price)}
          </p>
        </div>

        <div className={catalogCardActionsClassName}>
          <AddToCartButton
            item={{
              cakeSlug: cake.slug,
              categorySlug: category.slug,
              name: cake.name,
              image: displayImage,
              unitPrice: cake.price,
            }}
            className={cn(cardButtonClassName, "!min-w-0")}
          />
          <div className="grid min-w-0 grid-cols-2 gap-1 sm:gap-1.5">
            <Button href={orderHref} size="sm" className={cardButtonClassName}>
              Order
            </Button>
            <Button
              href={whatsappHref}
              variant="outline"
              size="sm"
              className={cardButtonClassName}
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
