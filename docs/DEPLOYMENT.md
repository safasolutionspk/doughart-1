# DoughArt — Production deployment checklist

Use this checklist when deploying the **backend** (API), **admin** (dashboard), and **frontend** (public shop). No real passwords or API keys belong in git — only in your host’s secret store or local `.env` files (gitignored).

**Full launch guide:** [PRODUCTION_LAUNCH.md](./PRODUCTION_LAUNCH.md) · **VPS + PM2 + Nginx:** [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) · **Day-2 ops:** [RUNBOOK.md](./RUNBOOK.md) · **Uploads:** [UPLOADS.md](./UPLOADS.md) · **Final QA:** [FINAL_QA_CHECKLIST.md](./FINAL_QA_CHECKLIST.md)

## Prerequisites

| Item | Notes |
| --- | --- |
| Node.js 20+ | All three apps |
| MongoDB 6+ | [Atlas](https://www.mongodb.com/atlas) (recommended) or secured self-hosted |
| Domain / hosting | API, admin, and website URLs (HTTPS in production) |
| Persistent disk | Required for Phase 1 local uploads at backend `uploads/images/` |

## 1. MongoDB

### Option A — Local (development only)

```text
mongodb://127.0.0.1:27017/doughart
```

### Option B — MongoDB Atlas (production)

1. Create a cluster and database user with read/write on the `doughart` database.
2. Network access: restrict to your API server IP(s); avoid `0.0.0.0/0` in production unless temporary for debugging.
3. Connection string (replace placeholders):

```text
mongodb+srv://DB_USER:DB_PASSWORD@cluster0.example.mongodb.net/doughart?retryWrites=true&w=majority&appName=Cluster0
```

Set `MONGODB_URI` in **backend** `.env` only.

## 2. Environment files

Copy examples (never commit filled `.env` files):

```bash
cp backend/.env.example backend/.env
cp admin/.env.example admin/.env.local
cp frontend/.env.example frontend/.env.local
```

### Backend — required variables

| Variable | Required | Production notes |
| --- | --- | --- |
| `MONGODB_URI` | Yes | Atlas TLS URI or local Mongo |
| `JWT_SECRET` | Yes | Min 16 chars dev; **32+ random chars in production** |
| `ADMIN_EMAIL` | Yes | Used for seed + default settings email |
| `ADMIN_PASSWORD` | Yes | Min 8 dev; **12+ strong password in production** |
| `CORS_ORIGIN` | Yes | Comma-separated HTTPS origins (shop + admin), no trailing slashes |
| `FRONTEND_URL` | Recommended | Public shop URL (HTTPS) |
| `ADMIN_URL` | Recommended | Admin dashboard URL (HTTPS) |

Customer checkout is **Cash on Delivery only** — new public orders are always created as `cash_on_delivery` and no env variable enables another public payment method.

### Admin — required variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL (e.g. `https://api.yourdomain.com`) |
| `JWT_SECRET` | Yes | **Must match backend** `JWT_SECRET` exactly |

### Frontend — required variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Same API URL as admin |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical shop URL for SEO |
| `NEXT_PUBLIC_WHATSAPP` | No | Legacy optional. Public shop WhatsApp uses `frontend/src/lib/contact.ts` (`923277707333` for display `0327 7707333`) and is not overridden by ENV or Admin settings. |

## 3. Build and start (production smoke test)

From repo root:

```bash
npm run build
```

Then on each host:

```bash
cd backend && NODE_ENV=production npm start    # port 5000
cd admin && npm run start                      # port 3001
cd frontend && npm run start                   # port 3000
```

## 4. Security verification

| Control | Status |
| --- | --- |
| `JWT_SECRET` validated at startup (16+ dev, 32+ production) | Implemented in `backend/src/config/env.ts` |
| `CORS_ORIGIN` comma-separated allowlist | Implemented |
| Upload max **5 MB**, MIME/extension + magic-byte validation | `backend/src/config/upload.ts`, `imageValidation.ts` |
| Rate limits: general, auth, orders, newsletter, uploads, admin writes | `backend/src/middleware/rateLimiter.ts` |
| Public order lookup requires **order number + phone** | `GET /api/orders/public/:orderNumber?phone=` |
| Public order responses omit email, phone, proof URL, admin notes | `PublicOrderResponse` type |
| Admin routes require Bearer JWT | `authenticateAdmin` middleware |
| Settings update requires admin auth | `PATCH /api/settings` |

## 5. Client-provided credentials (before go-live)

Configure these with the bakery owner — not in example env files:

| Item | Where to configure |
| --- | --- |
| **WhatsApp business number** | Admin → Settings + frontend `NEXT_PUBLIC_WHATSAPP` |
| **SMTP** (order emails) | Backend `EMAIL_ENABLED=true`, `EMAIL_PROVIDER=smtp`, `SMTP_*` |
| **Domain / SSL** | Hosting provider (Vercel, Railway, VPS, etc.) |

Customer payment is Cash on Delivery only — no payment gateway or bank-transfer credentials are needed. Historical orders may retain older payment metadata, which Admin still displays.

## 6. Hosting suggestions

| App | Suggested platforms |
| --- | --- |
| Backend | Railway, Render, Fly.io, VPS + PM2 |
| Admin | Vercel, Netlify, same VPS as API |
| Frontend | Vercel, Netlify, same VPS |
| MongoDB | MongoDB Atlas |
| Uploads | Persistent volume on API host (Phase 1 default), or optional Cloudinary upgrade (S3 not implemented) |

## 7. Post-deploy smoke tests

See [FINAL_QA_CHECKLIST.md](./FINAL_QA_CHECKLIST.md) (full) or [QA-RUNTIME-CHECKLIST.md](./QA-RUNTIME-CHECKLIST.md) (API-focused).

Quick checks:

- `GET https://api.yourdomain.com/api/health` → `database: connected`
- Admin login at `https://admin.yourdomain.com/login`
- Place test order on shop → appears in admin orders
- Category/cake images load from `/uploads/images/...` via `NEXT_PUBLIC_API_URL`

## 8. VPS deployment (PM2 + Nginx + SSL)

For a single-server or API-only VPS setup, follow **[VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md)**:

- Backend: `backend/ecosystem.config.cjs` → PM2 app `doughart-backend` (`dist/index.js`)
- Optional all-in-one: `deploy/ecosystem.all.cjs.example` (shop :3000, admin :3001)
- Nginx examples: [deployment/nginx/](./deployment/nginx/) (`api`, `shop`, `admin` hostnames)
- SSL: Certbot with `--nginx`
- Shop/admin on **Vercel**: keep API on VPS; set `CORS_ORIGIN` to Vercel HTTPS URLs

**Production commands:**

| App | Build | Start (PM2) |
| --- | --- | --- |
| Backend | `cd backend && npm run build` | `pm2 start ecosystem.config.cjs --env production` |
| Frontend | `cd frontend && npm run build` | `next start -p 3000` |
| Admin | `cd admin && npm run build` | `next start -p 3001` |

## 9. Operations (P2E)

| Document | Purpose |
| --- | --- |
| [RUNBOOK.md](./RUNBOOK.md) | Start/stop/restart, logs, health, smoke, emergency rollback |
| [MONITORING.md](./MONITORING.md) | Uptime, PM2, disk, Atlas, SMTP, upload alerts |
| [BACKUP.md](./BACKUP.md) | MongoDB, local uploads, Cloudinary, restore steps |
| [SMOKE_TESTS.md](./SMOKE_TESTS.md) | Automated post-deploy verification |

## 10. Ongoing operations

- Rotate `JWT_SECRET` only with a planned admin re-login (invalidates existing tokens).
- Back up MongoDB and `uploads/images` per [BACKUP.md](./BACKUP.md).
- Monitor per [MONITORING.md](./MONITORING.md) (`/api/health`, PM2, disk, SMTP errors).
- Keep `CORS_ORIGIN` in sync when adding staging/preview URLs.
