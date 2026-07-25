# DoughArt — Email notifications

Transactional emails are sent from the API using a small provider abstraction. **Order creation and quotes always succeed even if email fails** — errors are logged without SMTP secrets.

## Enable / disable

| Variable | Effect |
| --- | --- |
| `EMAIL_ENABLED=false` | No emails sent (noop provider) |
| `EMAIL_ENABLED=true` + `EMAIL_PROVIDER=console` | Log safe previews to server console (dev/staging) |
| `EMAIL_ENABLED=true` + `EMAIL_PROVIDER=smtp` | Send via nodemailer |

## Environment variables

### Required for SMTP

```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-address@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="DoughArt <your-address@gmail.com>"
```

`SMTP_PASS` is accepted as an alias for `SMTP_PASSWORD`.

### Recommended

```env
FRONTEND_URL=https://shop.example.com
ADMIN_URL=https://admin.example.com
NOTIFY_ADMIN_EMAIL=orders@example.com
```

- `FRONTEND_URL` — adds **My Order** links in customer emails  
- `ADMIN_URL` — adds **Open order in admin** links in staff emails  
- `NOTIFY_ADMIN_EMAIL` — receives new-order alerts

## Gmail app password setup

1. Use a Google account with 2-Step Verification enabled.  
2. Open [Google Account → Security → App passwords](https://myaccount.google.com/apppasswords).  
3. Create an app password for **Mail** (or **Other** → “DoughArt API”).  
4. Copy the 16-character password into `SMTP_PASSWORD` (no spaces).  
5. Example Gmail SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM="DoughArt <you@gmail.com>"
```

For Google Workspace, the admin may need to allow SMTP relay or app passwords for the mailbox.

## Test mode (console provider)

Without SMTP credentials:

```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=console
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
NOTIFY_ADMIN_EMAIL=admin@example.com
```

Place a test order. The API logs JSON lines like:

```json
{"type":"email_preview","to":"customer@example.com","subject":"Order received — SA-...","textPreview":"...","htmlLength":4200}
```

No mail is sent; use this to verify templates and routing before enabling SMTP.

## Email events

| Event | Recipient | When |
| --- | --- | --- |
| Order confirmation | Customer (if email on order) | After `POST /api/orders` |
| New order alert | `NOTIFY_ADMIN_EMAIL` | After order create (if set) |
| Quote ready | Customer (if email on order) | Admin sets `quotedAmount` on custom cake |

## Templates

HTML + plain-text templates live under `src/services/email/templates/`:

- DoughArt branding (header, colors, footer)
- Order number, customer name, cake summary
- Payment method / status
- My Order link (`FRONTEND_URL/my-order`)
- Admin order link (`ADMIN_URL/dashboard/orders/{id}`)

## Security

- SMTP passwords are never logged (`safeErrorLog` redacts sensitive keys).  
- Failed sends do not roll back orders.
- Console provider only logs a short text preview, not full HTML body.

## Related

- [PRODUCTION_LAUNCH.md](../../docs/PRODUCTION_LAUNCH.md) — deploy checklist  
- [backend/.env.example](../.env.example) — variable template  
