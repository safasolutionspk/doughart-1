#!/usr/bin/env node
/**
 * Admin app page smoke — HTTP status checks (no browser).
 *
 * Usage:
 *   node scripts/smoke-admin.mjs
 *   ADMIN_URL=http://localhost:3001 node scripts/smoke-admin.mjs
 */
const BASE = (process.env.ADMIN_URL ?? "http://localhost:3001").replace(/\/$/, "");

/** Public or redirect-expected routes */
const CHECKS = [
  { path: "/login", label: "Login page", expectStatus: [200] },
  {
    path: "/dashboard",
    label: "Dashboard protected (redirect when logged out)",
    expectStatus: [200, 307, 308],
    follow: false,
  },
  {
    path: "/dashboard/categories",
    label: "Categories (protected)",
    expectStatus: [200, 307, 308],
    follow: false,
  },
  {
    path: "/dashboard/cakes",
    label: "Cakes (protected)",
    expectStatus: [200, 307, 308],
    follow: false,
  },
  {
    path: "/dashboard/orders",
    label: "Orders (protected)",
    expectStatus: [200, 307, 308],
    follow: false,
  },
  {
    path: "/dashboard/reviews",
    label: "Reviews (protected)",
    expectStatus: [200, 307, 308],
    follow: false,
  },
  {
    path: "/dashboard/settings",
    label: "Settings (protected)",
    expectStatus: [200, 307, 308],
    follow: false,
  },
  {
    path: "/dashboard/gallery",
    label: "Gallery (protected)",
    expectStatus: [200, 307, 308],
    follow: false,
  },
];

let passed = 0;
let failed = 0;

function ok(label) {
  passed += 1;
  console.log(`✓ ${label}`);
}

function fail(label, detail) {
  failed += 1;
  console.error(`✗ ${label}: ${detail}`);
}

async function checkRoute({ path, label, expectStatus, follow = true }) {
  const url = `${BASE}${path}`;
  try {
    const response = await fetch(url, {
      redirect: follow ? "follow" : "manual",
      headers: { Accept: "text/html" },
    });

    if (!expectStatus.includes(response.status)) {
      fail(label, `${url} → HTTP ${response.status} (expected ${expectStatus.join("|")})`);
      return;
    }

    if (path === "/login" && response.status === 200) {
      const html = await response.text();
      if (!html.toLowerCase().includes("login") && !html.includes("Sign in")) {
        fail(label, "page loaded but login UI not detected in HTML");
        return;
      }
    }

    ok(`${label} (${path})`);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  console.log("DoughArt — admin page smoke");
  console.log(`Target: ${BASE}\n`);

  for (const check of CHECKS) {
    await checkRoute(check);
  }

  console.log(`\n— Summary —`);
  console.log(`${passed} passed, ${failed} failed`);
  console.log(
    "\nNote: Protected routes should return 307/308 to /login when not authenticated.",
  );
  process.exit(failed > 0 ? 1 : 0);
}

main();
