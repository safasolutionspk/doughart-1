import { connectDatabase, disconnectDatabase } from "../config/database";
import { runSeed } from "../services/seed.service";

async function main() {
  await connectDatabase();
  await runSeed();
  await disconnectDatabase();
  console.log("Seed completed");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
