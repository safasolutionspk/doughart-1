# DoughArt — Production launch guide (P0)

Step-by-step guide to deploy the **backend API**, **admin dashboard**, and **public shop** for production. No real passwords or API keys belong in git.

## Architecture

| App | Default port | Production URL example |
| --- | --- | --- |
| Frontend (shop) | 3000 | `https://shop.example.com` |
| Admin | 3001 | `https://admin.example.com` |
| Backend API | 5000 | `https://api.example.com` |
| MongoDB | — | MongoDB Atlas |

## 1. Prerequisites

- Node.js **20+**
- MongoDB **6+** ([Atlas](https://www.mongodb.com/atlas) recommended)
- Three hostnames (or paths) with **HTTPS**
- Persistent disk for API uploads (see [UPLOADS.md](./UPLOADS.md))

## 2. MongoDB Atlas

1. Create cluster and database user (read/write on `sweetbite` database).
2. Network access: allow only your API server IP(s).
3. Copy connection string:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sweetbite?retryWrites=true&w=majority
```

Set as `MONGODB_URI` in **backend** `.env` only.

## 3. Environment variables

Copy templates (never commit filled `.env` files):

```bash
cp backend/.env.example backend/.env
cp admin/.env.example admin/.env.local
cp frontend/.env.example frontend/.env.local
```

### Backend — required in production

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas URI (TLS) |
| `JWT_SECRET` | **32+** random characters |
| `ADMIN_EMAIL` | Real admin email |
| `ADMIN_PASSWORD` | **12+** strong password (seed only) |
| `CORS_ORIGIN` | `https://shop.example.com,https://admin.example.com` (no trailing slashes, no localhost) |

### Backend — recommended

| Variable | Notes |
| --- | --- |
| `FRONTEND_URL` | `https://shop.example.com` |
| `ADMIN_URL` | `https://admin.example.com` |
| `EMAIL_ENABLED` | `true` when SMTP is ready |
| `EMAIL_PROVIDER` | `console` (test) or `smtp` (production) |
| `SMTP_*` | See §6 and [backend/docs/EMAIL.md](../backend/docs/EMAIL.md) |
| `NOTIFY_ADMIN_EMAIL` | New order + payment proof alerts |
| `FRONTEND_URL` | My Order links in customer emails |
| `ADMIN_URL` | Order detail links in admin emails |
| `ONLINE_PAYMENTS_ENABLED` | `false` until JazzCash/EasyPaisa live |
| `UPLOAD_PROVIDER` | `cloudinary` in production (or `local` + persistent disk) |
| `CLOUDINARY_*` | Required when `UPLOAD_PROVIDER=cloudinary` (see [UPLOADS.md](./UPLOADS.md)) |

### Admin — required

| Variable | Must match |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend public URL |
| `JWT_SECRET` | **Exactly** backend `JWT_SECRET` |

### Frontend — required

| Variable | Must match |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend public URL |
| `NEXT_PUBLIC_SITE_URL` | Public shop URL (SEO) |
| `NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED` | `false` until gateways live (sync with backend) |
| `NEXT_PUBLIC_BANK_PROOF_UPLOAD_ENABLED` | `false` (hide screenshot upload in shop; keep API for future) |
| `NEXT_PUBLIC_WHATSAPP` | Digits with country code (fallback if settings API empty) |

## 4. DNS and SSL

1. Point DNS:
   - `shop.example.com` → frontend host
   - `admin.example.com` → admin host
   - `api.example.com` → backend host
2. Enable HTTPS on all three (Let’s Encrypt, Cloudflare, or platform TLS).
3. Set `CORS_ORIGIN` to the **exact** HTTPS origins of shop + admin.

## 5. Deploy backend

```bash
cd backend
npm ci
npm run build
# First deploy only:
npm run seed
NODE_ENV=production npm start
```

**Checks:**

- `GET https://api.example.com/api/health` → `database: connected`
- Uploads configured (see [UPLOADS.md](./UPLOADS.md)):
  - **Local:** `UPLOAD_PROVIDER=local`, persistent volume on `uploads/images/`
  - **Cloudinary (recommended):** `UPLOAD_PROVIDER=cloudinary` + `CLOUDINARY_*` env vars

**Process manager (VPS):** PM2, systemd, or Docker with volume mount.

## 6. Email / SMTP setup

Full reference: [backend/docs/EMAIL.md](../backend/docs/EMAIL.md)

### Test without SMTP (staging / local)

```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=console
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
NOTIFY_ADMIN_EMAIL=admin@example.com
```

Place a test order — the API logs `email_preview` JSON lines (no mail sent).

### Production SMTP

1. Obtain SMTP credentials (Gmail App Password, SendGrid, etc.).
2. Set in backend `.env`:

```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-address@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="DoughArt <your-address@gmail.com>"
NOTIFY_ADMIN_EMAIL=orders@example.com
FRONTEND_URL=https://shop.example.com
ADMIN_URL=https://admin.example.com
```

**Gmail:** enable 2-Step Verification, then create an [App Password](https://myaccount.google.com/apppasswords) — use that value for `SMTP_PASSWORD`, not your normal Google password.

3. Restart API.
4. Place a test order — customer receives order confirmation; `NOTIFY_ADMIN_EMAIL` receives admin alert. Email failures are logged only; **orders still succeed**.

## 7. Payment setup

Full reference: [backend/docs/PAYMENTS.md](../backend/docs/PAYMENTS.md)

### Defaults (production-safe)

```env
# backend
ONLINE_PAYMENTS_ENABLED=false

# frontend
NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED=false
```

- Checkout shows **Cash on Delivery** and **Bank Transfer** only.
- API rejects `online_payment` when disabled.
- Bank details: **Admin → Settings → Bank transfer** (shown on checkout / order success / My Order).
- Payment proof upload remains available for bank transfer orders.

### Bank transfer go-live

1. In admin, set bank name, account title, account number/IBAN, and instructions.
2. Place a test order with bank transfer — confirm details appear on order success.
3. Upload proof from My Order — confirm admin receives email if `NOTIFY_ADMIN_EMAIL` is set.

### Online payment go-live (when client provides credentials)

**Client must provide:**

| JazzCash | EasyPaisa |
| --- | --- |
| Merchant ID | Store ID |
| Password / API key | Hash key / secret |
| Integrity salt | — |
| Sandbox + live portal access | Sandbox + live portal access |
| Return URL approval | Return URL approval |
| Webhook/IPN URL whitelisted | Webhook URL whitelisted |

**Engineering (before taking live payments):**

1. Set `ONLINE_PAYMENTS_ENABLED=true` and `NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED=true`.
2. Set `ONLINE_PAYMENT_GATEWAY` and all required `JAZZCASH_*` or `EASYPAISA_*` vars (API will not start if incomplete).
3. Implement gateway redirect + webhook signature verification — **orders stay `pending` until verified** (see PAYMENTS.md).
4. Configure gateway dashboard:
   - Webhook: `POST https://api.example.com/api/webhooks/payments/jazzcash` (or easypaisa)
   - Return: `https://shop.example.com/order-success/...`

## 8. Deploy admin

```bash
cd admin
npm ci
npm run build
npm run start
```

- Login: `https://admin.example.com/login`
- Verify catalog CRUD and orders against production API

## 9. Deploy frontend

```bash
cd frontend
npm ci
npm run build
npm run start
```

Or deploy to Vercel/Netlify with the same `NEXT_PUBLIC_*` env vars.

**Checks:**

- Categories/cakes load from API
- Images from `/uploads/images/` resolve via `NEXT_PUBLIC_API_URL`; Cloudinary URLs stored as full `https://` links work as-is
- Navigation works from all pages

## 10. Upload persistence and backup

See [UPLOADS.md](./UPLOADS.md).

**Backup checklist:**

- [ ] MongoDB Atlas automated backups enabled
- [ ] `uploads/images/` included in server backup or rsync
- [ ] Restore drill documented for ops

## 11. Security verification

| Control | Location |
| --- | --- |
| JWT 32+ chars in production | `backend/src/config/env.ts` |
| Admin password 12+ in production | `backend/src/config/env.ts` |
| CORS allowlist only | `backend/src/app.ts` |
| Helmet + rate limits | `backend/src/app.ts`, `rateLimiter.ts` |
| Public order lookup requires phone | `order.routes.ts` |
| Public orders omit PII/proof URLs | `types/publicOrder.ts` |
| Upload validation 5MB + MIME | `config/upload.ts`, `imageValidation.ts` |
| No stack traces in production 500s | `errorHandler.ts` |
| Online payment gated by env | `payment/guards.ts`, order validator |

## 12. Post-deploy QA

Run [FINAL_QA_CHECKLIST.md](./FINAL_QA_CHECKLIST.md) on production or staging URLs.

Automated smoke tests (see [SMOKE_TESTS.md](./SMOKE_TESTS.md)):

```bash
# API (health, public routes, customer auth, order)
npm run smoke

# Optional: full admin CRUD + uploads + proof flow
npm run verify:data-flow

# With shop/admin dev servers running:
npm run smoke:frontend
npm run smoke:admin
```

## 13. Rollback checklist

See **[RUNBOOK.md](./RUNBOOK.md)** (emergency rollback) and **[BACKUP.md](./BACKUP.md)** (restore).

1. `git checkout` previous tag; rebuild; `pm2 restart all`.
2. Restore MongoDB snapshot if data migration failed.
3. Restore `uploads/images/` from backup if `UPLOAD_PROVIDER=local`.
4. Revert `backend/.env` / Next.js env from vault (JWT change invalidates admin sessions).
5. Point DNS back to previous host if needed.

## 14. Client-provided credentials (before go-live)

| Item | Where |
| --- | --- |
| MongoDB Atlas user/password | `MONGODB_URI` |
| Production domains + SSL | Hosting |
| SMTP | Backend `SMTP_*` |
| Bank transfer details | Admin → Settings |
| WhatsApp number | Admin → Settings + `NEXT_PUBLIC_WHATSAPP` |
| JazzCash / EasyPaisa | Backend payment env (when enabling online pay) |

## Related

- [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) — PM2, Nginx, Certbot, Vercel split
- [RUNBOOK.md](./RUNBOOK.md) — production operations
- [MONITORING.md](./MONITORING.md) — alerts and health checks
- [BACKUP.md](./BACKUP.md) — backup schedule and restore
- [DEPLOYMENT.md](./DEPLOYMENT.md) — shorter checklist
- [SMOKE_TESTS.md](./SMOKE_TESTS.md) — automated smoke tests
- [QA-RUNTIME-CHECKLIST.md](./QA-RUNTIME-CHECKLIST.md) — original runtime QA
- [FINAL_QA_CHECKLIST.md](./FINAL_QA_CHECKLIST.md) — full pre-launch QA
