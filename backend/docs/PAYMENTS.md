# DoughArt — Payments

Customer checkout is **Cash on Delivery only**.

- Customers do not select a payment method — checkout shows a fixed
  "Payment Method: Cash on Delivery" block.
- Every new public order is created as `cash_on_delivery` with
  `paymentStatus=pending`. The value is enforced server-side in
  `order.service.ts` and validated in `order.validator.ts`; any explicitly
  supplied non-COD payment method is rejected with a 400 validation error.
- No payment gateway, bank-transfer settings, or payment env variables are
  required. There is no customer payment integration, payment-proof upload, or
  webhook endpoint.

## Payment statuses

| Status | Meaning |
| --- | --- |
| `pending` | Cash not yet collected (initial status for every new order) |
| `paid` | Admin marked paid after collecting cash on delivery |
| `failed` | Payment failed / rejected |

Admin updates payment status on the order detail page after delivery.
Customers see status on **My Order**, **order success**, and **/account**.

## Historical orders

Older orders may retain legacy payment metadata
(`bank_transfer`, `online_payment`, `online_payment_full`,
`online_payment_advance`, gateway identifiers, transaction IDs, or uploaded
proof images). These values remain in the order model enums so historical
records stay readable in Admin and the public order lookup, but no new order
can be created with them.

## Code map

| Area | Path |
| --- | --- |
| COD enforcement | `src/services/order.service.ts` (`createOrder`) |
| Order validation | `src/validators/order.validator.ts` (`publicCreateOrderSchema`) |
| Payment types (incl. legacy) | `src/types/payment.ts` |
| Gateway resolution (historical) | `src/services/payment/index.ts` |
| Payable amount (historical 50% advance) | `src/services/payment/amounts.ts` |

## Related

- [PRODUCTION_LAUNCH.md](../../docs/PRODUCTION_LAUNCH.md)
- [EMAIL.md](./EMAIL.md) — order notifications
