# DoughArt — Admin

Next.js admin dashboard for orders, catalog, gallery, and business settings.

**Default port:** `3001`

## Prerequisites

- Node.js 20+
- Backend API running on port **5000** (see [backend/README.md](../backend/README.md))

## Setup

```bash
cd admin
npm install
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL, no trailing slash (e.g. `http://localhost:5000`) |
| `JWT_SECRET` | Yes | **Must match** backend `JWT_SECRET` (server-only, never expose to browser) |

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). Sign in with credentials from backend seed (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

Ensure backend `CORS_ORIGIN` includes `http://localhost:3001`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port **3001** |
| `npm run build` | Production build |
| `npm run start` | Production server on port **3001** |
| `npm run lint` | ESLint |

## Dashboard routes

| Path | Description |
| --- | --- |
| `/login` | Admin sign-in |
| `/dashboard` | Overview with live analytics (orders, revenue, paid/unpaid) |
| `/dashboard/orders` | Orders list & filters |
| `/dashboard/orders/[id]` | Order detail & status |
| `/dashboard/categories` | Categories CRUD |
| `/dashboard/cakes` | Cakes CRUD |
| `/dashboard/gallery` | Image library |
| `/dashboard/settings` | Business settings |

## Dashboard analytics

The home dashboard calls `GET /api/analytics/dashboard` (via `/api/analytics/dashboard` proxy) and shows:

- Total orders
- Pending orders (status `pending`)
- Total revenue (non-cancelled orders)
- Paid / unpaid revenue and order counts (`paymentStatus`)

## Auth flow

1. Login posts to Next.js `/api/auth/login` → proxies to backend.
2. **httpOnly** cookies store JWT (`sb_admin_token`) and profile (`sb_admin_profile`), **7-day** max-age (see `src/lib/auth/constants.ts`; backend `JWT_EXPIRES_IN=7d` must match).
3. `middleware.ts` protects `/dashboard/*`: no valid session → redirect `/login` (never opens dashboard without auth).
4. Logged-in visit to `/login` → redirect `/dashboard`.
5. Expired/invalid token → `/login?reason=session-expired` (cookies cleared when token was present but invalid).
6. Logout clears cookies via `POST /api/auth/logout`.

## Production

```bash
npm run build
npm run start   # port 3001 — use a process manager or host that sets PORT if needed
```

### Production env (e.g. Vercel / VPS)

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
JWT_SECRET=<same-as-backend-jwt-secret>
```

On Vercel, set `JWT_SECRET` and `NEXT_PUBLIC_API_URL` in project environment variables. If the host assigns a different port, configure the platform (admin dev uses 3001 by design).

### Hosting notes

- Admin is a standard Next.js 16 app; deploy like any App Router project.
- `JWT_SECRET` is only used in server routes/middleware — do not prefix with `NEXT_PUBLIC_`.
- Backend must allow your admin origin in `CORS_ORIGIN`.
