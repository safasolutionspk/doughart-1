import { connectDatabase, disconnectDatabase } from "../config/database";
import { seedSaasFoundation } from "../services/saasSeed.service";

async function main() {
  await connectDatabase();

  try {
    const result = await seedSaasFoundation();

    console.log("SaaS foundation seed completed");
    console.log("tenant:", result.tenant.status);
    console.log("workspace:", result.workspace.status);
    console.log("plan:", result.plan.status);
    console.log("subscription:", result.subscription.status);
    console.log("membership:", result.membership.status);

    if (result.domain.reason) {
      console.log(`domain: ${result.domain.status} (${result.domain.reason})`);
    } else {
      console.log("domain:", result.domain.status);
    }
  } finally {
    await disconnectDatabase();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("SaaS foundation seed failed:", error);
    process.exit(1);
  });
