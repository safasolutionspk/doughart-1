# DoughArt — VPS deployment (PM2 + Nginx + SSL)

Deploy all three apps on a single Linux VPS, or run **only the API** on VPS and host shop/admin on **Vercel**.

Replace example domains:

| Role | Example |
| --- | --- |
| Shop | `https://doughart.com` |
| Admin | `https://admin.doughart.com` |
| API | `https://api.doughart.com` |

---

## 1. Server prerequisites

- Ubuntu 22.04+ or Debian 12+ (similar steps)
- Node.js **20 LTS** (`nodesource` or `nvm`)
- `npm` 10+
- `git`
- [PM2](https://pm2.keymetrics.io/) (`npm install -g pm2`)
- Nginx
- Certbot (`certbot` + `python3-certbot-nginx`)

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx git
sudo npm install -g pm2
node -v   # v20+
```

---

## 2. DNS

| Hostname | Points to |
| --- | --- |
| `api.doughart.com` | VPS public IP |
| `doughart.com` | VPS IP **or** Vercel |
| `admin.doughart.com` | VPS IP **or** Vercel |

Set `CORS_ORIGIN` on the API to the **exact** HTTPS origins of shop + admin (comma-separated, no trailing slash).

---

## 3. Clone and build

```bash
sudo mkdir -p /opt/doughart
sudo chown $USER:$USER /opt/doughart
cd /opt/doughart
git clone <your-repo-url> .
git checkout <release-tag-or-main>

# Install dependencies (production)
cd backend && npm ci && npm run build && cd ..
cd frontend && npm ci && npm run build && cd ..
cd admin && npm ci && npm run build && cd ..
```

---

## 4. Environment files (on server only)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — see PRODUCTION_LAUNCH.md

cp frontend/.env.example frontend/.env.local
cp admin/.env.example admin/.env.local
```

**Production examples:**

`backend/.env` (critical):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<32+ random chars>
ADMIN_EMAIL=...
ADMIN_PASSWORD=<12+ chars — seed once>
CORS_ORIGIN=https://doughart.com,https://admin.doughart.com
FRONTEND_URL=https://doughart.com
ADMIN_URL=https://admin.doughart.com
UPLOAD_PROVIDER=cloudinary
# or UPLOAD_PROVIDER=local + persistent uploads volume
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.doughart.com
NEXT_PUBLIC_SITE_URL=https://doughart.com
```

`admin/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.doughart.com
JWT_SECRET=<same as backend JWT_SECRET>
```

First deploy only:

```bash
cd /opt/doughart/backend && npm run seed
```

---

## 5. Backend — PM2

From `backend/`:

```bash
cd /opt/doughart/backend
mkdir -p logs uploads/images
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup   # follow printed command for boot on reboot
```

**Commands:**

| Action | Command |
| --- | --- |
| Status | `pm2 status` |
| Logs | `pm2 logs doughart-backend` |
| Restart | `pm2 restart doughart-backend` |
| Stop | `pm2 stop doughart-backend` |

Logs also written to `backend/logs/pm2-*.log`.

### Local uploads volume (if `UPLOAD_PROVIDER=local`)

```bash
sudo mkdir -p /var/lib/doughart/uploads/images
sudo chown $USER:$USER /var/lib/doughart/uploads/images
# Symlink or bind-mount into backend/uploads/images
ln -sfn /var/lib/doughart/uploads/images /opt/doughart/backend/uploads/images
```

See [UPLOADS.md](./UPLOADS.md).

---

## 6. Frontend + admin on same VPS (PM2)

Option A — use example all-in-one config:

```bash
cp /opt/doughart/deploy/ecosystem.all.cjs.example /opt/doughart/ecosystem.config.cjs
# Edit REPO path if needed
mkdir -p /opt/doughart/frontend/logs /opt/doughart/admin/logs
pm2 start /opt/doughart/ecosystem.config.cjs --env production
pm2 save
```

Option B — start individually:

```bash
cd /opt/doughart/frontend
pm2 start node_modules/next/dist/bin/next --name doughart-frontend -- start -p 3000

cd /opt/doughart/admin
pm2 start node_modules/next/dist/bin/next --name doughart-admin -- start -p 3001

pm2 save
```

**Build/start commands (reference):**

| App | Build | Start |
| --- | --- | --- |
| Backend | `npm run build` → `dist/index.js` | PM2 `ecosystem.config.cjs` |
| Frontend | `npm run build` | `next start -p 3000` |
| Admin | `npm run build` | `next start -p 3001` |

---

## 7. Frontend / admin on Vercel (alternative)

| App | Vercel settings |
| --- | --- |
| Root directory | `frontend` or `admin` |
| Build | `npm run build` (default Next.js) |
| Env | Same `NEXT_PUBLIC_*` / `JWT_SECRET` as above |

Point `doughart.com` and `admin.doughart.com` DNS to Vercel. Keep API on VPS with `api.doughart.com`.

---

## 8. Nginx reverse proxy

Copy examples from [deployment/nginx/](./deployment/nginx/):

```bash
sudo cp docs/deployment/nginx/api.doughart.conf.example /etc/nginx/sites-available/doughart-api
sudo cp docs/deployment/nginx/shop.doughart.conf.example /etc/nginx/sites-available/doughart-shop
sudo cp docs/deployment/nginx/admin.doughart.conf.example /etc/nginx/sites-available/doughart-admin

sudo ln -s /etc/nginx/sites-available/doughart-api /etc/nginx/sites-enabled/
# Enable shop/admin only if hosted on this VPS

sudo nginx -t && sudo systemctl reload nginx
```

### SSL (Certbot)

```bash
sudo certbot --nginx -d api.doughart.com
sudo certbot --nginx -d doughart.com -d www.doughart.com
sudo certbot --nginx -d admin.doughart.com
```

Renewal is automatic via systemd timer (`certbot renew`).

---

## 9. CORS notes

- Browser CORS is enforced by **Express** using `CORS_ORIGIN` in `backend/.env`.
- Nginx must **not** add conflicting `Access-Control-Allow-Origin` headers.
- After changing shop/admin domains, update `CORS_ORIGIN` and restart API: `pm2 restart doughart-backend`.
- `FRONTEND_URL` / `ADMIN_URL` are for emails and links, not CORS.

---

## 10. Post-deploy verification

```bash
curl -s https://api.doughart.com/api/health | jq .
# Expect: success true, database "connected"

cd /opt/doughart && npm run smoke
API_BASE=https://api.doughart.com npm run smoke
```

Manual: admin login, test order (checkout shows Cash on Delivery only).

See [SMOKE_TESTS.md](./SMOKE_TESTS.md), [RUNBOOK.md](./RUNBOOK.md), [MONITORING.md](./MONITORING.md), [BACKUP.md](./BACKUP.md).

---

## Related

- [PRODUCTION_LAUNCH.md](./PRODUCTION_LAUNCH.md) — env tables, email, payments
- [DEPLOYMENT.md](./DEPLOYMENT.md) — short checklist
- [RUNBOOK.md](./RUNBOOK.md) — day-2 operations
