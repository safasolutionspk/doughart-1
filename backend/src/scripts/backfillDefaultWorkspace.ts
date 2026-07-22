import { connectDatabase, disconnectDatabase } from "../config/database";
import { backfillDefaultWorkspaceData } from "../services/saasBackfill.service";

async function main() {
  await connectDatabase();

  try {
    const result = await backfillDefaultWorkspaceData();

    console.log("SaaS default workspace backfill completed");
    console.log(
      `default scope: tenant=${result.tenantSlug}, workspace=${result.workspaceSlug}`,
    );
    console.log(
      `BusinessSettings: missing=${result.businessSettings.matchedMissing}, modified=${result.businessSettings.modified}, alreadyScoped=${result.businessSettings.alreadyScoped}`,
    );
    console.log(
      `Category: missing=${result.category.matchedMissing}, modified=${result.category.modified}, alreadyScoped=${result.category.alreadyScoped}`,
    );
    console.log(
      `Cake: missing=${result.cake.matchedMissing}, modified=${result.cake.modified}, alreadyScoped=${result.cake.alreadyScoped}`,
    );
    console.log(
      `Order: missing=${result.order.matchedMissing}, modified=${result.order.modified}, alreadyScoped=${result.order.alreadyScoped}`,
    );
    console.log(
      `Review: missing=${result.review.matchedMissing}, modified=${result.review.modified}, alreadyScoped=${result.review.alreadyScoped}`,
    );
    console.log(
      `NewsletterSubscriber: missing=${result.newsletterSubscriber.matchedMissing}, modified=${result.newsletterSubscriber.modified}, alreadyScoped=${result.newsletterSubscriber.alreadyScoped}`,
    );
    console.log(
      `Customer: missing=${result.customer.matchedMissing}, modified=${result.customer.modified}, alreadyScoped=${result.customer.alreadyScoped}`,
    );
  } finally {
    await disconnectDatabase();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("SaaS default workspace backfill failed:", error);
    process.exit(1);
  });
