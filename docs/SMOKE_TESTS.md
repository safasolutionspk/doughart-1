# DoughArt — Smoke tests (pre-deploy)

Quick verification that the API, shop, and admin are running correctly before production deployment.

---

## Prerequisites

| Requirement | Notes |
| --- | --- |
| MongoDB | Running and reachable via `MONGODB_URI` in `backend/.env` |
| Backend API | `npm run dev` or `npm run start` in `backend` (port **5000**) |
| Frontend shop | `npm run dev` in `frontend` (port **3000**) — for page smoke |
| Admin | `npm run dev` in `admin` (port **3001**) — for page smoke |
| Seed (first time) | `npm run seed` from repo root — admin user + default settings |

### Minimum env (local smoke)

**Backend** (`backend/.env`):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/sweetbite
JWT_SECRET=dev-secret-at-least-16-chars
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-strong-password
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

**Frontend** (`frontend/.env.local`): `NEXT_PUBLIC_API_URL=http://localhost:5000`

**Admin** (`admin/.env.local`): `NEXT_PUBLIC_API_URL=http://localhost:5000`, `JWT_SECRET` same as backend

---

## How to run apps (manual QA)

```bash
# Terminal 1 — API
cd backend && npm run dev

# Terminal 2 — Shop
cd frontend && npm run dev

# Terminal 3 — Admin
cd admin && npm run dev
```

Production build smoke (optional):

```bash
npm run build
npm run start:backend
npm run start:frontend
npm run start:admin
```

---

## Automated tests

### 1. API smoke (recommended)

From repo root or `backend`:

```bash
npm run smoke
# or
cd backend && npm run smoke
```

Against staging/production API:

```bash
API_BASE=https://api.example.com npm run smoke
```

**What it checks**

| Step | Endpoint |
| --- | --- |
| Health | `GET /api/health` → `database: connected` |
| Catalog | `GET /api/categories/public`, `/api/cakes/public` |
| Reviews | `GET /api/reviews/public` |
| Settings | `GET /api/settings` |
| Newsletter | `POST /api/newsletter` |
| Customer auth | `POST /api/customers/signup`, `login`, `GET /me` |
| Order | `POST /api/orders` (with customer JWT) |
| Account orders | `GET /api/customers/orders` |

**Expected pass output**

```text
DoughArt — API smoke test
Target: http://localhost:5000
...
✓ GET /api/health (database connected)
✓ GET /api/categories/public (N items)
...
— Summary —
12 passed, 0 failed
```

Exit code **0** = pass, **1** = fail.

**Common failures**

| Message | Fix |
| --- | --- |
| `database=disconnected` | Start MongoDB; check `MONGODB_URI` |
| `fetch failed` / ECONNREFUSED | Start backend on port 5000 |
| `POST /api/orders` 401 | Set `REQUIRE_CUSTOMER_AUTH_FOR_ORDERS=false` for guest dev, or ensure signup step passed |
| Newsletter 429 | Rate limit — wait 1 minute and retry |

### 2. Full data-flow verification (deeper)

Admin CRUD, image upload, payment proof attach:

```bash
npm run verify:data-flow
# or
cd backend && npm run verify:data-flow
```

Requires valid `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`. Creates temporary category/cake/review data.

### 3. Frontend page smoke

With frontend dev server running:

```bash
npm run smoke:frontend
# FRONTEND_URL=https://shop.example.com npm run smoke:frontend
```

Checks HTTP **200** for: `/`, `/cakes`, `/cart`, `/checkout`, `/login`, `/signup`, `/account`, `/my-order`, `/about`, `/gallery`, `/reviews`, `/contact`.

### 4. Admin page smoke

With admin dev server running:

```bash
npm run smoke:admin
# ADMIN_URL=https://admin.example.com npm run smoke:admin
```

Checks `/login` (200) and dashboard routes (307/308 redirect to login when logged out).

---

## Manual smoke checklist — Frontend (shop)

Run in browser while logged out unless noted.

| # | Page | Pass criteria |
| --- | --- | --- |
| 1 | `/` | Homepage loads; header/footer; cakes section |
| 2 | `/cakes` | Category/cake listing loads |
| 3 | `/cart` | Empty cart or items; link to checkout |
| 4 | `/checkout` | Form loads; payment methods (no online if disabled) |
| 5 | `/login` | Sign-in form |
| 6 | `/signup` | Registration form |
| 7 | `/account` | Redirects to login when logged out |
| 8 | `/my-order` | Order lookup form |
| 9 | `/about` | Content loads |
| 10 | `/gallery` | Images load |
| 11 | `/reviews` | Reviews list |
| 12 | `/contact` | Contact info / WhatsApp |

**Logged-in (optional):** Sign up → `/account` shows profile + orders; checkout places order when cart has items.

---

## Manual smoke checklist — Admin

| # | Page | Pass criteria |
| --- | --- | --- |
| 1 | `/login` | Admin login form |
| 2 | `/dashboard` | Redirects to login when logged out |
| 3 | Log in | Dashboard stats load |
| 4 | `/dashboard/categories` | List / create / edit |
| 5 | `/dashboard/cakes` | List / create / edit |
| 6 | `/dashboard/orders` | Orders list; open detail |
| 7 | `/dashboard/reviews` | Reviews list |
| 8 | `/dashboard/settings` | Business + bank transfer fields save |
| 9 | `/dashboard/gallery` | Image gallery loads |

---

## Manual smoke checklist — API / integrations

| # | Check |
| --- | --- |
| 1 | `GET /api/health` → `database: connected` |
| 2 | Bank transfer details in Admin → Settings appear on checkout |
| 3 | Payment proof upload (My Order) succeeds |
| 4 | `ONLINE_PAYMENTS_ENABLED=false` — online option hidden |
| 5 | Email `EMAIL_PROVIDER=console` — order creates `email_preview` log |

See also: [FINAL_QA_CHECKLIST.md](./FINAL_QA_CHECKLIST.md), [PRODUCTION_LAUNCH.md](./PRODUCTION_LAUNCH.md).

---

## Package scripts reference

| Command | Location | Description |
| --- | --- | --- |
| `npm run smoke` | repo root / backend | API smoke test |
| `npm run smoke:frontend` | repo root | Frontend HTTP page smoke |
| `npm run smoke:admin` | repo root | Admin HTTP page smoke |
| `npm run verify:data-flow` | repo root / backend | Full admin + order data flow |

---

## Suggested pre-deploy sequence

1. `npm run build` (all apps)
2. Start API + `npm run smoke`
3. Start frontend + `npm run smoke:frontend`
4. Start admin + `npm run smoke:admin`
5. Manual browser pass on checkout + one test order
6. Optional: `npm run verify:data-flow`
