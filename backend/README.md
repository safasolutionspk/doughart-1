# DoughArt — Backend API

REST API for DoughArt bakery. **Express 5**, **TypeScript**, **MongoDB**.

**Default port:** `5000`

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — see Environment variables below
npm run seed    # run intentionally when you want to seed admin + defaults
npm run dev     # http://localhost:5000
```

`npm run dev` and `npm start` do not run seed automatically.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run production build (`node dist/index.js`) |
| `npm run seed` | Manual seed: admin user + business settings + default reviews |
| `npm run seed:saas` | Manual seed: default tenant/workspace/plan/subscription/membership foundation |
| `npm run backfill:saas-default` | Manual backfill: assign existing records to default tenant/workspace |

## Environment variables

Copy `.env.example` to `.env`.

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | `development` \| `production` \| `test` (default: `development`) |
| `PORT` | No | HTTP port (default: `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Signing secret (min 16 chars; **32+ in production**) |
| `JWT_EXPIRES_IN` | No | Token TTL (default: `7d`) |
| `ADMIN_EMAIL` | Yes | Seed admin email |
| `ADMIN_PASSWORD` | Yes | Seed admin password (min 8; **12+ in production**) |
| `ADMIN_NAME` | No | Seed admin display name |
| `CORS_ORIGIN` | Yes | Comma-separated allowed origins (shop + admin URLs) |
| `FRONTEND_URL` | No | Public shop URL (HTTPS in production) |
| `ADMIN_URL` | No | Admin dashboard URL (HTTPS in production) |
| `JSON_BODY_LIMIT` | No | Max JSON body size (default: `512kb`) |
| `URLENCODED_BODY_LIMIT` | No | Max URL-encoded body (default: `512kb`) |
| `UPLOAD_PROVIDER` | No | `local` (default, Phase 1); `cloudinary` optional upgrade; `s3` is not implemented |
| `EMAIL_ENABLED` | No | `true` to send notifications (default: off) |
| `EMAIL_PROVIDER` | No | `noop` \| `console` \| `smtp` (nodemailer when `smtp` + `EMAIL_ENABLED=true`) |
| `SMTP_*` | No | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` or `SMTP_PASS`, `SMTP_FROM` |

Customer checkout is **Cash on Delivery only** — new public orders are always created as `cash_on_delivery` (`paymentStatus=pending`) and any other supplied payment method is rejected with a 400 validation error. Historical orders may retain older payment metadata.

See [docs/EMAIL.md](./docs/EMAIL.md) and [docs/PAYMENTS.md](./docs/PAYMENTS.md) for email and payment notes.

### Production example

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://DB_USER:DB_PASSWORD@cluster0.example.mongodb.net/doughart?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=replace-with-a-strong-production-password
CORS_ORIGIN=https://www.yourdomain.com,https://admin.yourdomain.com
```

## MongoDB

**Local**

```text
mongodb://127.0.0.1:27017/doughart
```

**Atlas**

1. Create cluster → Database → Connect → Drivers.
2. Use connection string with username, password, and database name.
3. Whitelist deployment server IPs.

On `npm run seed`, admin, settings, and default reviews are created if missing.
Seeding is intentional and manual; normal backend startup does not seed data.

`npm run seed:saas` is also manual-only and prepares default SaaS foundation records for the current single-business setup:
- Tenant
- Workspace
- Plan
- Subscription
- owner Membership for existing admin

This does not tenant-scope existing cakes/orders/settings or change current app behavior.

Run `npm run backfill:saas-default` only after `npm run seed:saas`.

`npm run backfill:saas-default` assigns existing records to the default Tenant/Workspace for:
- BusinessSettings
- Category
- Cake
- Order
- Review
- NewsletterSubscriber
- Customer

The backfill is idempotent and manual-only. It does not enable tenant filtering and does not change app behavior by itself.

## API overview

Base URL: `http://localhost:5000` (local)

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/settings` | Business settings |
| POST | `/api/auth/login` | Admin login (returns JWT) |
| POST | `/api/orders` | Place order (website / checkout form; always Cash on Delivery, optional `cakeSlug`) |
| GET | `/api/orders/public/:orderNumber?phone=` | Order confirmation (requires matching phone) |
| GET | `/api/categories/public` | Active categories (catalog) |
| GET | `/api/cakes/public` | Active cakes (optional `?categorySlug=`) |
| GET | `/api/cakes/public/:slug` | Single active cake by slug |
| GET | `/api/reviews/public` | Active homepage reviews |
| POST | `/api/newsletter` | Newsletter signup (`email`, `source`, `consent: true`) |
| POST | `/api/customers/forgot-password` | Request customer password reset (generic response) |
| POST | `/api/customers/reset-password` | Set new customer password using reset token |

### Admin (Bearer JWT)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/analytics/dashboard` | Dashboard stats (orders, revenue, paid/unpaid) |
| GET/PATCH | `/api/orders` … | Orders list, detail, status & payment status |
| CRUD | `/api/categories` | Categories |
| CRUD | `/api/cakes` | Cakes |
| POST/GET/DELETE | `/api/uploads/…` | Image upload & gallery |
| PATCH | `/api/settings` | Update business settings |

Static uploads: `GET /uploads/images/<filename>`

### Auth header

```http
Authorization: Bearer <token>
```

### Response format

```json
{ "success": true, "message": "…", "data": { } }
{ "success": false, "message": "…", "errors": { } }
```

## Public order example

```bash
POST /api/orders
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "03046736831",
  "cakeType": "Birthday Cake",
  "flavor": "Chocolate",
  "size": "8\" (serves ~12)",
  "message": "Happy Birthday!",
  "deliveryDate": "2026-06-15",
  "address": "123 Main St",
  "notes": "Pink theme"
}
```

## Project structure

```text
src/
  config/       env, database, upload paths
  controllers/  route handlers
  middleware/   auth, validation, rate limits, audit log
  models/       Mongoose schemas
  routes/       API routers
  services/     business logic
  validators/   Zod schemas
  utils/        helpers, safe logging
  scripts/      seed
uploads/images/ uploaded files (gitignored)
```

## Production notes

- Run `npm run build` then `npm start` (or use PM2/systemd).
- Phase 1 default upload storage is local disk at `backend/uploads/images`.
- On VPS, mount `backend/uploads/images` to persistent disk so deploys/restarts do not remove files.
- Back up `backend/uploads/images` together with MongoDB.
- Cloudinary remains supported as an optional production upgrade.
- S3 provider is not implemented in this codebase.
- Do not commit `.env` or `uploads/images/*`.
- Rate limiting, helmet, and upload magic-byte validation are enabled.
- Password reset emails use `FRONTEND_URL/reset-password?token=...`; enable email delivery (`EMAIL_ENABLED=true` with `EMAIL_PROVIDER`) for real reset emails.
