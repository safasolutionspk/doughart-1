# DoughArt — Payments (production readiness)

Phase 1 checkout supports **cash on delivery** and **bank transfer** only.
Online payment gateways remain placeholders and must stay disabled for launch.

**Defaults (safe):**

- `ONLINE_PAYMENTS_ENABLED=false` (backend)
- `NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED=false` (frontend)

Online payment is hidden in checkout and rejected by the API until both flags are `true` **and** gateway credentials are configured. For Phase 1 production, keep both flags `false`.
Orders are **never** marked paid without manual admin action or a verified webhook (webhook verification not implemented yet).

---

## Payment methods

| Method | Gateway | Customer flow |
| --- | --- | --- |
| `cash_on_delivery` | `manual` | Pay cash on delivery — `paymentStatus` stays `pending` until admin marks paid |
| `bank_transfer` | `bank_transfer` | Bank details from Admin → Settings; optional proof upload at checkout or My Order |
| `online_payment` | `jazzcash` or `easypaisa` | **Placeholder only** — keep disabled for Phase 1 |

### Payment statuses

| Status | Meaning |
| --- | --- |
| `pending` | Not yet confirmed paid |
| `paid` | Admin or verified gateway webhook marked paid |
| `failed` | Payment failed / rejected |

Admin updates status on order detail. Customers see status on **My Order**, **order success**, and **/account**.

---

## Bank transfer

### Admin settings

Configure under **Admin → Settings → Bank transfer**:

- Bank name  
- Account title  
- Account number / IBAN  
- Payment instructions (reference text, upload proof reminder)

Exposed publicly via `GET /api/settings` (no secrets).

### Customer UI

Bank details appear when `bank_transfer` is selected:

- Checkout (before optional proof upload)  
- Order success page  
- My Order lookup  

### Proof upload

1. `POST /api/uploads/public/payment-proof` (multipart `image`, max 5MB)  
2. Attach to order:
   - At checkout: `proofImage` on `POST /api/orders`
   - Later: `POST /api/orders/public/proof` with `orderNumber`, `phone`, `proofImage`

---

## Online payment (JazzCash / EasyPaisa)

### Current behaviour

- Flag off → method hidden (frontend) and rejected (API).  
- Flag on + missing credentials → API startup validation fails (env) or order rejected with clear message.  
- Flag on + credentials set → order accepted with `paymentStatus=pending`; **no redirect / no auto-paid**.  
- Webhooks log only — **do not** update payment status until signature verification is implemented.

### Phase 1 production policy

- Keep `ONLINE_PAYMENTS_ENABLED=false`.
- Keep `NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED=false`.
- Collect payments using COD or bank transfer only.
- For bank transfer orders, admin verifies proof manually, then marks `paymentStatus=paid` in admin.

### Environment variables

```env
ONLINE_PAYMENTS_ENABLED=false
ONLINE_PAYMENT_GATEWAY=jazzcash
PAYMENT_GATEWAY_MODE=sandbox

# JazzCash (when ONLINE_PAYMENT_GATEWAY=jazzcash)
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=

# EasyPaisa (when ONLINE_PAYMENT_GATEWAY=easypaisa)
EASYPAISA_STORE_ID=
EASYPAISA_HASH_KEY=

# Used in docs / future redirect URLs
FRONTEND_URL=https://shop.example.com
```

Frontend (must match when enabling online pay):

```env
NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED=false
```

### What the client must provide (future online-payment go-live)

**JazzCash**

| Item | Env / config |
| --- | --- |
| Merchant ID | `JAZZCASH_MERCHANT_ID` |
| Password / API key | `JAZZCASH_PASSWORD` |
| Integrity salt | `JAZZCASH_INTEGRITY_SALT` |
| Return URL | `{FRONTEND_URL}/order-success/...` (configure in JazzCash portal) |
| Webhook / IPN URL | `POST {API_URL}/api/webhooks/payments/jazzcash` |
| Sandbox vs live | `PAYMENT_GATEWAY_MODE=sandbox` or `live` + portal mode |

**EasyPaisa**

| Item | Env / config |
| --- | --- |
| Store ID | `EASYPAISA_STORE_ID` |
| Hash key / secret | `EASYPAISA_HASH_KEY` |
| Return URL | `{FRONTEND_URL}/order-success/...` |
| Webhook URL | `POST {API_URL}/api/webhooks/payments/easypaisa` |
| Sandbox vs live | `PAYMENT_GATEWAY_MODE` + EasyPaisa dashboard |

**Engineering TODO (before marking paid automatically)**

1. Implement gateway redirect or mobile wallet API on order create.  
2. Verify webhook signatures in `processPaymentWebhook`.  
3. Match `transactionId` to order; set `paymentStatus=paid` only on verified success.  
4. Never trust client-side “payment success” without webhook.

---

## Webhook routes (placeholder)

| Method | Endpoint |
| --- | --- |
| POST | `/api/webhooks/payments/jazzcash` |
| POST | `/api/webhooks/payments/easypaisa` |

---

## Code map

| Area | Path |
| --- | --- |
| Method guards | `src/services/payment/guards.ts` |
| Credential checks | `src/services/payment/credentials.ts` |
| Gateway resolution | `src/services/payment/index.ts` |
| Order validation | `src/validators/order.validator.ts` |
| Bank settings | `BusinessSettings` + `settings.service.ts` |

---

## Related

- [PRODUCTION_LAUNCH.md](../../docs/PRODUCTION_LAUNCH.md)  
- [EMAIL.md](./EMAIL.md) — order / proof notifications  
