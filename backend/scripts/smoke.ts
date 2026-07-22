/**
 * Production API smoke test — read-only public endpoints + customer auth + order.
 *
 * Prerequisites:
 *   - API running (default http://localhost:5000)
 *   - MongoDB connected
 *   - Seeded admin not required; creates ephemeral customer
 *
 * Usage:
 *   npm run smoke
 *   API_BASE=https://api.example.com npm run smoke
 */
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API = (process.env.API_BASE ?? "http://localhost:5000").replace(/\/$/, "");

type ApiOk<T> = { success: true; data: T; message?: string };
type ApiFail = { success: false; message: string; errors?: unknown };

let passed = 0;
let failed = 0;
const failures: string[] = [];

function ok(name: string) {
  passed += 1;
  console.log(`✓ ${name}`);
}

function fail(name: string, detail: string) {
  failed += 1;
  failures.push(`${name}: ${detail}`);
  console.error(`✗ ${name}: ${detail}`);
}

async function apiJson<T>(
  route: string,
  init?: RequestInit,
): Promise<{ status: number; body: ApiOk<T> | ApiFail }> {
  const response = await fetch(`${API}${route}`, init);
  let body: ApiOk<T> | ApiFail;
  try {
    body = (await response.json()) as ApiOk<T> | ApiFail;
  } catch {
    body = { success: false, message: "Invalid JSON response" };
  }
  return { status: response.status, body };
}

function resolveRequireCustomerAuth(): boolean {
  const raw = process.env.REQUIRE_CUSTOMER_AUTH_FOR_ORDERS?.trim().toLowerCase();
  if (raw === "true" || raw === "1") {
    return true;
  }
  if (raw === "false" || raw === "0") {
    return false;
  }
  const nodeEnv = process.env.NODE_ENV ?? "development";
  return nodeEnv === "production";
}

async function main() {
  const requireCustomerAuth = resolveRequireCustomerAuth();

  console.log("DoughArt — API smoke test");
  console.log(`Target: ${API}`);
  console.log(
    `Order auth: ${requireCustomerAuth ? "customer JWT required" : "guest allowed (dev)"}\n`,
  );

  const health = await apiJson<{
    status: string;
    database: string;
    timestamp: string;
  }>("/api/health");

  if (
    health.status === 200 &&
    health.body.success &&
    health.body.data.database === "connected"
  ) {
    ok("GET /api/health (database connected)");
  } else {
    const db =
      health.body.success && "data" in health.body
        ? health.body.data.database
        : "unknown";
    fail("GET /api/health", `HTTP ${health.status}, database=${db}`);
    printSummary();
    process.exit(1);
  }

  const categories = await apiJson<unknown[]>("/api/categories/public");
  if (categories.status === 200 && categories.body.success && Array.isArray(categories.body.data)) {
    ok(`GET /api/categories/public (${categories.body.data.length} items)`);
  } else {
    fail("GET /api/categories/public", describeResponse(categories));
  }

  const cakes = await apiJson<unknown[]>("/api/cakes/public");
  if (cakes.status === 200 && cakes.body.success && Array.isArray(cakes.body.data)) {
    ok(`GET /api/cakes/public (${cakes.body.data.length} items)`);
  } else {
    fail("GET /api/cakes/public", describeResponse(cakes));
  }

  const reviews = await apiJson<unknown[]>("/api/reviews/public");
  if (reviews.status === 200 && reviews.body.success && Array.isArray(reviews.body.data)) {
    ok(`GET /api/reviews/public (${reviews.body.data.length} items)`);
  } else {
    fail("GET /api/reviews/public", describeResponse(reviews));
  }

  const settings = await apiJson<{ businessName: string }>("/api/settings");
  if (
    settings.status === 200 &&
    settings.body.success &&
    settings.body.data.businessName?.trim()
  ) {
    ok(`GET /api/settings (${settings.body.data.businessName})`);
  } else {
    fail("GET /api/settings", describeResponse(settings));
  }

  const newsletterEmail = `smoke-${Date.now()}@example.com`;
  const newsletter = await apiJson<{ email: string }>("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: newsletterEmail,
      source: "smoke-test",
      consent: true,
    }),
  });

  if (newsletter.status === 201 && newsletter.body.success) {
    ok("POST /api/newsletter");
  } else if (newsletter.status === 409 && !newsletter.body.success) {
    ok("POST /api/newsletter (already subscribed — acceptable)");
  } else {
    fail("POST /api/newsletter", describeResponse(newsletter));
  }

  const smokeEmail = `smoke-${Date.now()}@example.com`;
  const smokePassword = "SmokeTest123!";
  const smokePhone = "03001234567";

  const signup = await apiJson<{
    token: string;
    customer: { id: string; email: string; name: string };
  }>("/api/customers/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Test User",
      email: smokeEmail,
      phone: smokePhone,
      password: smokePassword,
    }),
  });

  let customerToken = "";
  if (signup.status === 201 && signup.body.success && signup.body.data.token) {
    customerToken = signup.body.data.token;
    ok("POST /api/customers/signup");
  } else {
    fail("POST /api/customers/signup", describeResponse(signup));
  }

  if (customerToken) {
    const login = await apiJson<{ token: string }>("/api/customers/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: smokeEmail,
        password: smokePassword,
      }),
    });

    if (login.status === 200 && login.body.success && login.body.data.token) {
      customerToken = login.body.data.token;
      ok("POST /api/customers/login");
    } else {
      fail("POST /api/customers/login", describeResponse(login));
    }

    const me = await apiJson<{ email: string; name: string }>("/api/customers/me", {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    if (me.status === 200 && me.body.success && me.body.data.email === smokeEmail) {
      ok("GET /api/customers/me");
    } else {
      fail("GET /api/customers/me", describeResponse(me));
    }
  }

  const orderPayload = {
    name: "Smoke Test User",
    email: smokeEmail,
    phone: smokePhone,
    cakeType: "Smoke Test Cake",
    size: "2 pounds",
    flavor: "Chocolate",
    address: "123 Test Street, Lahore",
    paymentMethod: "cash_on_delivery",
  };

  const orderHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (customerToken) {
    orderHeaders.Authorization = `Bearer ${customerToken}`;
  }

  const order = await apiJson<{ orderNumber: string }>("/api/orders", {
    method: "POST",
    headers: orderHeaders,
    body: JSON.stringify(orderPayload),
  });

  if (order.status === 201 && order.body.success && order.body.data.orderNumber) {
    ok(`POST /api/orders (${order.body.data.orderNumber})`);

    if (customerToken) {
      const myOrders = await apiJson<unknown[]>("/api/customers/orders", {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      if (myOrders.status === 200 && myOrders.body.success && Array.isArray(myOrders.body.data)) {
        ok(`GET /api/customers/orders (${myOrders.body.data.length} order(s))`);
      } else {
        fail("GET /api/customers/orders", describeResponse(myOrders));
      }
    }
  } else if (order.status === 401 && requireCustomerAuth && !customerToken) {
    fail(
      "POST /api/orders",
      "401 unauthorized — signup/login failed earlier; customer auth required for orders",
    );
  } else if (order.status === 401 && !requireCustomerAuth) {
    fail("POST /api/orders", describeResponse(order));
  } else {
    fail("POST /api/orders", describeResponse(order));
  }

  printSummary();
  process.exit(failed > 0 ? 1 : 0);
}

function describeResponse(result: {
  status: number;
  body: ApiOk<unknown> | ApiFail;
}): string {
  if (!result.body.success && "message" in result.body) {
    return `HTTP ${result.status} — ${result.body.message}`;
  }
  return `HTTP ${result.status}`;
}

function printSummary() {
  console.log(`\n— Summary —`);
  console.log(`${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log("\nFailures:");
    for (const line of failures) {
      console.log(`  • ${line}`);
    }
  }
}

main().catch((error) => {
  console.error("\nSmoke test aborted:", error instanceof Error ? error.message : error);
  process.exit(1);
});
