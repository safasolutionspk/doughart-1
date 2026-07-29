# DoughArt — Email notifications

Transactional emails are sent from the API using a provider abstraction with
**EmailAttempt** tracking. **Order creation, status updates, and Contact Us
always succeed even if email fails** — errors are logged without SMTP secrets.

## Behaviour

| Event | Recipient | When |
| --- | --- | --- |
| New order (owner) | `ORDER_NOTIFICATION_EMAIL` (fallback `ADMIN_EMAIL`) | After order is saved (`pending`) |
| Order confirmed (customer) | Saved order email | First Admin transition **to** `confirmed` only |
| Quote ready (customer) | Saved order email | First time `quotedAmount` is set (&gt; 0) |
| Contact Us (owner) | `CONTACT_NOTIFICATION_EMAIL` (fallback order/admin) | Valid Contact Us form submit |
| Password reset | Customer account email | Forgot-password request |

Customer email is **optional** at checkout. Phone remains required. There is **no OTP**.

Statuses shown in Admin:

- **Sent** — the configured provider accepted the message. **Does not guarantee inbox delivery.**
- **Failed** — provider/send error (safe reason code only)
- **Skipped** — e.g. missing/invalid email, or `EMAIL_ENABLED=false`
- **Pending** — reserved but not yet finalized (rare)

There is **no** delivery webhook and **no** automatic retry queue in this phase.

## Enable / disable

| Variable | Effect |
| --- | --- |
| `EMAIL_ENABLED=false` | Attempts are tracked as `skipped` / `email_disabled` |
| `EMAIL_ENABLED=true` + `EMAIL_PROVIDER=console` | Log safe previews to server console |
| `EMAIL_ENABLED=true` + `EMAIL_PROVIDER=smtp` | Send via nodemailer |

## Environment variables (names only — never commit real values)

```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=console
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ORDER_NOTIFICATION_EMAIL=
CONTACT_NOTIFICATION_EMAIL=
FRONTEND_URL=
ADMIN_URL=
```

`SMTP_PASS` is accepted as an alias for `SMTP_PASSWORD`.

- `ORDER_NOTIFICATION_EMAIL` — owner new-order recipient (server-controlled)
- `CONTACT_NOTIFICATION_EMAIL` — Contact Us owner recipient (server-controlled; never from visitor input)
- `FRONTEND_URL` — My Order / password-reset links
- `ADMIN_URL` — Admin deep links in owner emails

## Idempotency

Stable `attemptKey` values (unique index):

- `owner_order_created:{orderId}`
- `customer_order_confirmed:{orderId}`
- `customer_quote_ready:{orderId}`
- `contact_owner_notification:{submissionId}`

Only the request that successfully reserves the attempt may send. Duplicate keys do not resend.

## Admin reporting

Protected endpoints (Admin JWT required):

- `GET /api/analytics/emails/summary` — total / sent / failed / skipped
- `GET /api/analytics/emails/attempts` — paginated recent attempts (safe fields only)

Tracking stores **no** full email body, SMTP credentials, stacks, or secrets.
Recipient addresses are masked or omitted.

## Security

- HTML escaping for customer-controlled fields
- Subject/header injection stripping (`\\r` / `\\n`)
- Owner recipients are always server ENV — never visitor-controlled
- Visitor email is Reply-To on Contact Us **only** when syntactically valid
- SMTP passwords are never logged (`safeErrorLog` redacts sensitive keys)
- Failed sends do not roll back orders or status updates

## Templates

HTML + plain-text under `src/services/email/templates/` with shared DoughArt footer:

```
DoughArt Bakers
Crafting beautiful custom cakes for life’s sweetest moments.
0327 7707333
doughartbakers@gmail.com
Thokkar Niaz Baig, Lahore, Punjab, Pakistan
WhatsApp: https://wa.me/923277707333
```

## Related

- [PRODUCTION_LAUNCH.md](../../docs/PRODUCTION_LAUNCH.md)
- [backend/.env.example](../.env.example)
