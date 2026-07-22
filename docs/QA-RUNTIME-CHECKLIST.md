# DoughArt — Runtime QA checklist

Run after all three apps are built and started (local or staging). Automated script: `backend/scripts/verify-data-flow.ts` (API flows only).

## Automated API verification

```bash
cd backend
# Use a reachable MongoDB URI
$env:MONGODB_URI='mongodb://127.0.0.1:27017/sweetbite'   # PowerShell
npm run dev
# Another terminal:
$env:ADMIN_EMAIL='admin@example.com'
$env:ADMIN_PASSWORD='change-me-strong-password'
npx tsx scripts/verify-data-flow.ts
```

## Manual checklist

| # | Flow | How to verify | Pass |
| --- | --- | --- | --- |
| 1 | API health | `GET /api/health` → 200, `database: connected` | ☐ |
| 2 | Admin login | Admin `/login` with seed credentials | ☐ |
| 3 | Category CRUD | Create/edit category in admin | ☐ |
| 4 | Cake CRUD | Create/edit cake in admin | ☐ |
| 5 | Image upload | Upload category/cake image → shows in admin + public API | ☐ |
| 6 | Frontend categories | Homepage + `/cakes/{slug}` load API images | ☐ |
| 7 | Frontend cake detail | `/cakes/{cat}/{cake}` price, image, checkout link | ☐ |
| 8 | Checkout order | Complete checkout → order number shown | ☐ |
| 9 | My order lookup | `/my-order` with order # + phone | ☐ |
| 10 | Payment proof | Upload proof on order success / my-order | ☐ |
| 11 | Admin orders | New order visible in admin orders list | ☐ |
| 12 | Reviews | Admin review → homepage public reviews | ☐ |
| 13 | Newsletter | Homepage subscribe → success message | ☐ |
| 14 | Settings | Admin WhatsApp/phone → public settings / WhatsApp links | ☐ |

## Build verification (required before release)

```bash
cd backend && npm run build
cd ../admin && npm run build
cd ../frontend && npm run build
```

Or from root: `npm run build`
