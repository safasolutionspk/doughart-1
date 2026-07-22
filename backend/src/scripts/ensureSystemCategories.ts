import { connectDatabase } from "../config/database";
import { ensureComboOffersCategory } from "../services/systemCategory.service";
import { resolveTenantContext } from "../services/tenantContext.service";

async function main() {
  await connectDatabase();
  const tenantContext = await resolveTenantContext();
  const category = await ensureComboOffersCategory(tenantContext);
  console.log(
    `System category ready: ${category.name} (${category.slug}) id=${String(category._id)} ` +
      `scoped=${Boolean(category.tenantId && category.workspaceId)}`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("ensureSystemCategories failed:", error);
  process.exit(1);
});
