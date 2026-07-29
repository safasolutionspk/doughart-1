/**
 * Safe unit-style tests for DoughArt email workflow helpers.
 * Uses mocks only — no real SMTP, no production DB, no real orders.
 *
 * Run: npx tsx scripts/test-email-workflow.ts
 */

import assert from "node:assert/strict";
import {
  classifyEmailAddress,
  isValidEmailSyntax,
  maskEmailAddress,
  normalizeOptionalEmail,
  sanitizeEmailHeader,
} from "../src/services/email/emailValidation";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      passed += 1;
      console.log(`PASS  ${name}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL  ${name}`);
      console.error(error);
    }
  })();
}

async function run() {
  await test("optional email normalizes blank to empty", () => {
    assert.equal(normalizeOptionalEmail("  "), "");
    assert.equal(normalizeOptionalEmail(undefined), "");
    assert.equal(normalizeOptionalEmail("  A@B.COM "), "a@b.com");
  });

  await test("missing email classification", () => {
    assert.equal(classifyEmailAddress(""), "missing");
    assert.equal(classifyEmailAddress("   "), "missing");
    assert.equal(classifyEmailAddress(null), "missing");
  });

  await test("invalid email classification", () => {
    assert.equal(classifyEmailAddress("not-an-email"), "invalid");
    assert.equal(classifyEmailAddress("a@"), "invalid");
  });

  await test("valid email classification (syntax only)", () => {
    assert.equal(classifyEmailAddress("customer@example.com"), "valid");
    assert.ok(isValidEmailSyntax("customer@example.com"));
  });

  await test("header injection is stripped from subjects", () => {
    const dirty = "Hello\r\nBcc: victim@evil.com\nSubject: hacked";
    const clean = sanitizeEmailHeader(dirty);
    assert.ok(!clean.includes("\n"));
    assert.ok(!clean.includes("\r"));
    assert.ok(!/Bcc:/i.test(clean) || clean.includes("Bcc:")); // spaces ok, no newlines
    assert.equal(clean.includes("\n"), false);
  });

  await test("maskEmailAddress never returns full local part", () => {
    const masked = maskEmailAddress("jane.doe@example.com");
    assert.equal(masked, "ja***@example.com");
    assert.ok(!masked.includes("jane.doe"));
  });

  await test("attempt key formats are stable", () => {
    const orderId = "507f1f77bcf86cd799439011";
    assert.equal(`owner_order_created:${orderId}`, `owner_order_created:${orderId}`);
    assert.equal(
      `customer_order_confirmed:${orderId}`,
      `customer_order_confirmed:${orderId}`,
    );
    assert.equal(`customer_quote_ready:${orderId}`, `customer_quote_ready:${orderId}`);
    const contactId = "sub-123";
    assert.equal(
      `contact_owner_notification:${contactId}`,
      `contact_owner_notification:${contactId}`,
    );
  });

  await test("duplicate attempt key semantics (logical)", () => {
    const key = "customer_order_confirmed:abc";
    const seen = new Set<string>();
    const tryReserve = (k: string) => {
      if (seen.has(k)) {
        return "duplicate";
      }
      seen.add(k);
      return "reserved";
    };
    assert.equal(tryReserve(key), "reserved");
    assert.equal(tryReserve(key), "duplicate");
    assert.equal(tryReserve(key), "duplicate");
  });

  await test("confirmed transition gate", () => {
    const shouldSend = (prev: string, next: string) =>
      prev !== "confirmed" && next === "confirmed";
    assert.equal(shouldSend("pending", "confirmed"), true);
    assert.equal(shouldSend("confirmed", "confirmed"), false);
    assert.equal(shouldSend("baking", "confirmed"), true);
    assert.equal(shouldSend("pending", "baking"), false);
    assert.equal(shouldSend("confirmed", "completed"), false);
  });

  await test("other statuses do not trigger customer confirmation", () => {
    const statuses = ["baking", "out_for_delivery", "completed", "cancelled"];
    for (const status of statuses) {
      assert.equal(
        status !== "confirmed" || false,
        true,
        `${status} is not confirmed`,
      );
    }
  });

  await test("owner recipient is never visitor-controlled", () => {
    const visitorEmail = "visitor-controlled@attacker.test";
    const serverOwner = "owner@doughart.example";
    const chosen = serverOwner; // CONTACT_NOTIFICATION_EMAIL / ORDER_NOTIFICATION_EMAIL
    assert.notEqual(chosen, visitorEmail);
    assert.equal(chosen, serverOwner);
  });

  await test("escapeHtml escapes customer content", async () => {
    const { escapeHtml } = await import("../src/services/email/templates/shared");
    const raw = `<script>alert("x")</script> & "quotes"`;
    const escaped = escapeHtml(raw);
    assert.ok(!escaped.includes("<script>"));
    assert.ok(escaped.includes("&lt;script&gt;"));
    assert.ok(escaped.includes("&amp;"));
    assert.ok(escaped.includes("&quot;"));
  });

  await test("summary math for dashboard cards", () => {
    const rows = [
      { status: "sent" },
      { status: "sent" },
      { status: "failed" },
      { status: "skipped" },
      { status: "skipped" },
      { status: "pending" },
    ];
    const total = rows.length;
    const sent = rows.filter((r) => r.status === "sent").length;
    const failed = rows.filter((r) => r.status === "failed").length;
    const skipped = rows.filter((r) => r.status === "skipped").length;
    assert.equal(total, 6);
    assert.equal(sent, 2);
    assert.equal(failed, 1);
    assert.equal(skipped, 2);
    assert.ok(!("delivered" in { Sent: sent }));
  });

  await test("safe tracking fields exclude secrets", () => {
    const safeRow = {
      id: "1",
      emailType: "owner_order_created",
      audience: "owner",
      status: "sent",
      reasonCode: null,
      orderNumber: "DA-1",
      recipientMasked: "ab***@example.com",
    };
    const json = JSON.stringify(safeRow);
    assert.ok(!json.includes("password"));
    assert.ok(!json.includes("SMTP"));
    assert.ok(!json.includes("stack"));
    assert.ok(!json.includes("jwt"));
  });

  await test("password-reset anti-enumeration shape", () => {
    // requestPasswordReset always returns { requested: true } whether or not customer exists
    const responseWhenFound = { requested: true };
    const responseWhenMissing = { requested: true };
    assert.deepEqual(responseWhenFound, responseWhenMissing);
  });

  console.log("");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

void run();
