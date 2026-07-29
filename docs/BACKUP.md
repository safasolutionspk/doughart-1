# DoughArt — Backup and restore

Backup **MongoDB** and **uploaded images** before every production deploy and on a fixed schedule.

---

## What to back up

| Asset | When | Tool |
| --- | --- | --- |
| MongoDB (`doughart` database) | Daily minimum | Atlas automated backup **or** `mongodump` |
| `backend/uploads/images/` | Daily if `UPLOAD_PROVIDER=local` | `rsync` / volume snapshot |
| Cloudinary assets | Weekly export (optional) | Cloudinary Media Library export / API |
| `backend/.env` (secrets) | On change | Host secret store / encrypted vault — **not git** |
| PM2 / Nginx configs | On change | Git + server config backup |

---

## Schedule (recommended)

| Frequency | Action |
| --- | --- |
| **Continuous** | MongoDB Atlas [Cloud Backup](https://www.mongodb.com/docs/atlas/backup/cloud-backup/) (M10+ clusters) |
| **Daily** | Verify Atlas backup succeeded **or** run `mongodump` cron |
| **Daily** | `rsync` local `uploads/images/` to off-server storage (if local provider) |
| **Weekly** | Test restore on staging (see below) |
| **Before each deploy** | Manual snapshot / note Atlas point-in-time |

---

## MongoDB Atlas

1. Atlas → cluster → **Backup** → enable Cloud Backup (or use free tier export).
2. Network access: restrict API server IP only.
3. Store connection string in server `.env` only.

### Manual export (any tier)

```bash
mongodump --uri="$MONGODB_URI" --out=/backups/doughart-$(date +%Y%m%d)
tar -czf /backups/doughart-$(date +%Y%m%d).tar.gz -C /backups doughart-$(date +%Y%m%d)
```

Upload archive to S3, Backblaze, or another region.

### Restore (mongorestore)

```bash
tar -xzf doughart-20260520.tar.gz -C /tmp/restore
mongorestore --uri="$MONGODB_URI" --drop /tmp/restore/doughart-20260520
```

`--drop` removes existing collections first — use only during planned maintenance.

**Atlas UI restore:** Backup → Restore → choose snapshot → new cluster or same cluster (follow Atlas wizard).

---

## Local uploads (`UPLOAD_PROVIDER=local`)

### Backup

```bash
rsync -a --delete \
  /var/lib/doughart/uploads/images/ \
  /backups/doughart/uploads/images/
```

Or include in nightly VPS snapshot (LVM, cloud provider backup).

### Restore

```bash
rsync -a /backups/doughart/uploads/images/ /var/lib/doughart/uploads/images/
pm2 restart doughart-backend
```

Verify: open a known image URL `https://api.doughart.com/uploads/images/<filename>`.

---

## Cloudinary (`UPLOAD_PROVIDER=cloudinary`)

- Primary storage is Cloudinary; MongoDB stores **URLs**, not files.
- Enable Cloudinary backup/versioning per your plan.
- Periodic export: Media Library bulk download or scripted `admin.api.resources` export.
- **Restore:** re-upload assets and update MongoDB `image` fields only if URLs changed (rare if using stable `secure_url`).

After switching local → Cloudinary, keep old local backup until all catalog images are re-uploaded.

---

## Environment secrets

| Store | Contents |
| --- | --- |
| Password manager / vault | `JWT_SECRET`, `MONGODB_URI`, SMTP, Cloudinary, gateway keys |
| Server | `backend/.env`, `frontend/.env.local`, `admin/.env.local` |

Document which env vars changed each release (see [RUNBOOK.md](./RUNBOOK.md) rollback).

---

## Pre-deploy backup checklist

- [ ] Atlas backup green / fresh `mongodump` taken
- [ ] `uploads/images/` rsync completed (if local)
- [ ] Git tag created for release (`git tag v1.2.0`)
- [ ] `.env` snapshot saved in vault

---

## Related

- [UPLOADS.md](./UPLOADS.md)
- [RUNBOOK.md](./RUNBOOK.md) — emergency restore
- [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md)
