# DoughArt — Production runbook

Day-2 operations for VPS + PM2 + Nginx. For first-time install see [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md).

**Example hosts:** `api.sweetbite.com` · `sweetbite.com` · `admin.sweetbite.com`  
**Repo on server:** `/opt/sweetbite`

---

## Quick reference

| Service | Port | PM2 name |
| --- | --- | --- |
| API | 5000 | `sweetbite-backend` |
| Shop | 3000 | `sweetbite-frontend` |
| Admin | 3001 | `sweetbite-admin` |

---

## Start services

```bash
cd /opt/sweetbite/backend
pm2 start ecosystem.config.cjs --env production

# If using all-in-one config:
pm2 start /opt/sweetbite/ecosystem.config.cjs --env production

pm2 save
sudo systemctl start nginx
```

---

## Stop services

```bash
pm2 stop sweetbite-backend sweetbite-frontend sweetbite-admin
# or: pm2 stop all

sudo systemctl stop nginx   # only if maintenance window
```

---

## Restart services

```bash
# After .env change or deploy:
pm2 restart sweetbite-backend

# All apps:
pm2 restart all

sudo systemctl reload nginx
```

---

## Check logs

```bash
# Live tail
pm2 logs sweetbite-backend
pm2 logs sweetbite-frontend --lines 200

# Files
tail -f /opt/sweetbite/backend/logs/pm2-error.log
tail -f /var/log/nginx/error.log
```

**Structured API logs:** Morgan JSON lines in PM2 stdout.

**Email failures:** search for `[email]` or `"type":"error"`.

---

## Check health

```bash
curl -s https://api.sweetbite.com/api/health | jq .
```

Expect `success: true`, `data.database: "connected"`.

From repo (on server or CI):

```bash
cd /opt/sweetbite
API_BASE=https://api.sweetbite.com npm run smoke
```

---

## Deploy new release (routine)

1. **Backup** — [BACKUP.md](./BACKUP.md): MongoDB + uploads.
2. **Maintenance** (optional): show static page on shop if needed.
3. **Pull code:**
   ```bash
   cd /opt/sweetbite
   git fetch && git checkout <tag>
   ```
4. **Build:**
   ```bash
   cd backend && npm ci && npm run build && cd ..
   cd frontend && npm ci && npm run build && cd ..
   cd admin && npm ci && npm run build && cd ..
   ```
5. **Migrate** — no automatic migrations; review release notes.
6. **Restart:**
   ```bash
   pm2 restart all
   ```
7. **Verify:** health + smoke + one test order.
8. **Monitor** 15 min — [MONITORING.md](./MONITORING.md).

---

## Run smoke tests

```bash
cd /opt/sweetbite
npm run smoke
API_BASE=https://api.sweetbite.com npm run smoke

# Deeper (creates test data):
npm run verify:data-flow

# UI (dev servers or production URLs):
FRONTEND_URL=https://sweetbite.com npm run smoke:frontend
ADMIN_URL=https://admin.sweetbite.com npm run smoke:admin
```

See [SMOKE_TESTS.md](./SMOKE_TESTS.md).

---

## Emergency rollback

Use when a deploy breaks orders, auth, or admin.

### 1. Stop bleeding

```bash
pm2 stop sweetbite-backend   # or all apps
```

### 2. Git rollback

```bash
cd /opt/sweetbite
git log -1 --oneline
git checkout <previous-tag-or-commit>
```

### 3. Rebuild previous version

```bash
cd backend && npm ci && npm run build && cd ..
cd frontend && npm ci && npm run build && cd ..
cd admin && npm ci && npm run build && cd ..
```

### 4. Restore environment

Restore `backend/.env`, `frontend/.env.local`, `admin/.env.local` from vault snapshot if env changed.

**Note:** Changing `JWT_SECRET` logs out all admins.

### 5. Restore MongoDB (only if data corrupted)

Follow [BACKUP.md](./BACKUP.md) — `mongorestore` or Atlas point-in-time restore. **Downtime required.**

### 6. Restore uploads (local provider only)

```bash
rsync -a /backups/sweetbite/uploads/images/ /var/lib/sweetbite/uploads/images/
```

### 7. Restart and verify

```bash
pm2 restart all
curl -s https://api.sweetbite.com/api/health | jq .
npm run smoke
```

### 8. DNS rollback (last resort)

Point domains to previous host/IP if you moved servers.

---

## Common incidents

| Issue | Action |
| --- | --- |
| 502 Bad Gateway | `pm2 status`; restart backend; check port 5000 |
| CORS errors in browser | Fix `CORS_ORIGIN` in `backend/.env`; restart API |
| Images 404 | Check `UPLOAD_PROVIDER`, disk path, Nginx `/uploads/` proxy |
| Admin login fails | `JWT_SECRET` match between admin and backend |
| Orders not emailing | SMTP env; `pm2 logs` for `[email]` — orders still save |
| Disk full | `df -h`; rotate logs; expand volume |

---

## Contacts and docs

| Doc | Purpose |
| --- | --- |
| [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) | Install, Nginx, SSL |
| [PRODUCTION_LAUNCH.md](./PRODUCTION_LAUNCH.md) | Env, email, payments |
| [BACKUP.md](./BACKUP.md) | Backup/restore |
| [MONITORING.md](./MONITORING.md) | Alerts checklist |
| [SMOKE_TESTS.md](./SMOKE_TESTS.md) | Automated tests |

---

## Production build commands (reference)

```bash
# From repo root
npm run build

# Per app
cd backend && npm run build    # → dist/
cd frontend && npm run build   # → .next/
cd admin && npm run build      # → .next/

# Start (without PM2)
cd backend && NODE_ENV=production npm start
cd frontend && npm run start
cd admin && npm run start
```
