import { connectDatabase } from "../config/database";
import { ensureComboOffersCategory } from "../services/systemCategory.service";

async function main() {
  await connectDatabase();
  const category = await ensureComboOffersCategory();
  console.log(
    `System category ready: ${category.name} (${category.slug}) id=${String(category._id)}`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error("ensureSystemCategories failed:", error);
  process.exit(1);
});
