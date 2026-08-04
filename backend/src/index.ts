import "./config/dnsServers";

import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { ensureComboOffersCategory } from "./services/systemCategory.service";
import { resolveTenantContext } from "./services/tenantContext.service";

async function bootstrap() {
  await connectDatabase();
  const tenantContext = await resolveTenantContext();
  await ensureComboOffersCategory(tenantContext);

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`Health: http://localhost:${env.PORT}/api/health`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
