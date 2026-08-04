# DoughArt — Payments

## Current policy

- **Cash on Delivery only.** Customers do not select a payment method.
- Checkout shows a fixed "Payment Method: Cash on Delivery" block.
- Every new order is persisted with `paymentMethod=cash_on_delivery`.
- Payment workflow fields (`paymentStatus`, `paymentGateway`, `proofImage`,
  `transactionId`, `gatewayResponse`) are **not written** on new orders and
  are **not exposed** by public, customer, or admin APIs.
- Historical MongoDB documents may still contain those fields; they are left
  in place (no migration / no `$unset`).

## Order amounts

- `totalAmount` and optional `quotedAmount` remain the source of order value.
- There is no payable-amount / advance calculation and no paid/unpaid tracking.

## Legacy

Older orders may retain legacy payment metadata in the database
(`bank_transfer`, `online_payment*`, gateway identifiers, proof images).
Admin UI may still display the stored `paymentMethod` label for those rows;
workflow status is not shown or editable.
