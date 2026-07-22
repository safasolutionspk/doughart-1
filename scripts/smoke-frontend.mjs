#!/usr/bin/env node
/**
 * Frontend page smoke — HTTP status checks (no browser).
 *
 * Usage:
 *   node scripts/smoke-frontend.mjs
 *   FRONTEND_URL=https://shop.example.com node scripts/smoke-frontend.mjs
 */
const BASE = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PATHS = [
  { path: "/", label: "Homepage" },
  { path: "/cakes", label: "Cakes listing" },
  { path: "/cart", label: "Cart" },
  { path: "/checkout", label: "Checkout" },
  { path: "/login", label: "Login" },
  { path: "/signup", label: "Signup" },
  { path: "/account", label: "Account" },
  { path: "/my-order", label: "My Order" },
  { path: "/custom-cake", label: "Custom cake" },
  { path: "/about", label: "About" },
  { path: "/gallery", label: "Gallery" },
  { path: "/reviews", label: "Reviews" },
  { path: "/contact", label: "Contact" },
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

async function checkPage({ path, label }) {
  const url = `${BASE}${path}`;
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "text/html" },
    });

    if (response.status !== 200) {
      fail(label, `${url} → HTTP ${response.status}`);
      return;
    }

    const html = await response.text();
    if (html.length < 200) {
      fail(label, `${url} → response too small (${html.length} bytes)`);
      return;
    }

    ok(`${label} (${path})`);
  } catch (error) {
    fail(label, error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  console.log("DoughArt — frontend page smoke");
  console.log(`Target: ${BASE}\n`);

  for (const page of PATHS) {
    await checkPage(page);
  }

  console.log(`\n— Summary —`);
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
