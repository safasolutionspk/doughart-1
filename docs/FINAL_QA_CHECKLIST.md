# DoughArt — Final QA checklist (pre-launch)

Complete on **staging** or **production** URLs after all three apps are deployed. Mark each item when verified.

**Automated API flows (optional):**

```bash
cd backend
# API must be running with valid MongoDB
$env:MONGODB_URI='mongodb://127.0.0.1:27017/sweetbite'   # PowerShell
$env:ADMIN_EMAIL='admin@example.com'
$env:ADMIN_PASSWORD='your-seed-password'
npx tsx scripts/verify-data-flow.ts
```

---

## Production environment check

| # | Check | Pass |
| --- | --- | --- |
| E1 | `GET /api/health` → 200, `database: connected` | ☐ |
| E2 | `NODE_ENV=production` on API | ☐ |
| E3 | `JWT_SECRET` ≥ 32 characters (backend + admin match) | ☐ |
| E4 | `CORS_ORIGIN` = HTTPS shop + admin only (no localhost) | ☐ |
| E5 | `NEXT_PUBLIC_API_URL` correct on frontend + admin | ☐ |
| E6 | `NEXT_PUBLIC_SITE_URL` set on frontend | ☐ |
| E7 | `ONLINE_PAYMENTS_ENABLED=false` (backend) unless gateways live | ☐ |
| E8 | `NEXT_PUBLIC_ONLINE_PAYMENTS_ENABLED=false` (frontend) unless live | ☐ |
| E9 | Upload directory persistent on API host | ☐ |
| E10 | SMTP tested if `EMAIL_ENABLED=true` | ☐ |

---

## Admin

| # | Flow | Pass |
| --- | --- | --- |
| A1 | Login at `/login` | ☐ |
| A2 | Dashboard loads analytics | ☐ |
| A3 | Category create / edit / delete | ☐ |
| A4 | Cake create / edit / delete | ☐ |
| A5 | Category image upload → preview in admin | ☐ |
| A6 | Cake image upload → preview in admin | ☐ |
| A7 | Gallery manager lists uploads | ☐ |
| A8 | Review create → active on public site | ☐ |
| A9 | Order appears after shop places order | ☐ |
| A10 | Order status update | ☐ |
| A11 | Quote update (custom cake) | ☐ |
| A12 | Settings save (phone, WhatsApp, bank text) | ☐ |

---

## Frontend — catalog & pages

| # | Flow | Pass |
| --- | --- | --- |
| F1 | Homepage loads (hero, categories) | ☐ |
| F2 | `/about` loads | ☐ |
| F3 | `/cakes` → category listing | ☐ |
| F4 | Category page shows API cakes + images | ☐ |
| F5 | Cake detail: price, image, Order Now | ☐ |
| F6 | `/gallery` — images load (no broken imgs) | ☐ |
| F7 | `/reviews` — API or fallback reviews | ☐ |
| F8 | `/contact` — WhatsApp + email links work | ☐ |
| F9 | Nav from `/cakes`, `/my-order`, `/checkout`: Home, About, Gallery, Reviews, Contact | ☐ |
| F10 | Mobile menu opens/closes; links navigate | ☐ |

---

## Frontend — orders

| # | Flow | Pass |
| --- | --- | --- |
| O1 | Checkout with catalog cake (`?cake=slug`) | ☐ |
| O2 | Checkout payment options: COD + bank only (online hidden when disabled) | ☐ |
| O3 | Custom cake order form submits | ☐ |
| O4 | Order success page shows order number | ☐ |
| O5 | `/my-order` lookup with order # + phone | ☐ |
| O6 | Bank transfer: payment proof upload + attach | ☐ |
| O7 | Newsletter subscribe on homepage | ☐ |

---

## Mobile responsiveness

| # | Screen | Pass |
| --- | --- | --- |
| M1 | Homepage hero + nav (phone width) | ☐ |
| M2 | Checkout form usable on phone | ☐ |
| M3 | Cake category grid | ☐ |
| M4 | Gallery grid | ☐ |
| M5 | Admin sidebar / tables (tablet) | ☐ |

---

## Security (smoke)

| # | Check | Pass |
| --- | --- | --- |
| S1 | Wrong phone on order lookup → not found | ☐ |
| S2 | Public order JSON has no email/phone/proof URL | ☐ |
| S3 | Admin routes without JWT → 401 | ☐ |
| S4 | API 500 in production returns generic message | ☐ |

---

## Build verification (required before release tag)

```bash
cd backend && npm run build
cd ../admin && npm run build
cd ../frontend && npm run build
```

Or from repo root: `npm run build`

| App | Pass |
| --- | --- |
| Backend `tsc` | ☐ |
| Admin `next build` | ☐ |
| Frontend `next build` | ☐ |

---

## Sign-off

| Role | Name | Date |
| --- | --- | --- |
| Engineering | | |
| Client / bakery owner | | |
