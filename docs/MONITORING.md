# DoughArt — Monitoring checklist

Use this for daily ops and uptime alerts. No APM is bundled — start with health checks, PM2, disk, and log patterns.

---

## 1. API health (uptime)

**Endpoint:** `GET https://api.doughart.com/api/health`

**Healthy response:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "timestamp": "..."
  }
}
```

| Check | Tool examples |
| --- | --- |
| HTTP 200 + `database: connected` | UptimeRobot, Better Stack, Pingdom, cron + curl |
| Interval | Every 1–5 minutes |
| Alert | Email/SMS/Slack on 2+ failures |

```bash
curl -sf https://api.doughart.com/api/health | jq -e '.success and .data.database == "connected"'
```

---

## 2. PM2 process status

On VPS:

```bash
pm2 status
pm2 monit
```

| Process | Expected |
| --- | --- |
| `doughart-backend` | online |
| `doughart-frontend` | online (if on VPS) |
| `doughart-admin` | online (if on VPS) |

Alert if any process is `errored`, restart count spikes, or memory at `max_memory_restart` repeatedly.

```bash
pm2 logs doughart-backend --lines 100 --nostream
```

---

## 3. Server disk usage

```bash
df -h
du -sh /opt/doughart/backend/uploads/images
du -sh /opt/doughart/backend/logs
du -sh /var/log/nginx
```

| Threshold | Action |
| --- | --- |
| Disk &gt; 80% | Clean old logs, rotate PM2 logs, expand volume |
| Uploads growing fast | Confirm Cloudinary migration or expand backup volume |

```bash
# Optional: logrotate for PM2 logs (create /etc/logrotate.d/doughart)
```

---

## 4. Upload directory size (local provider)

```bash
find /opt/doughart/backend/uploads/images -type f | wc -l
du -sh /opt/doughart/backend/uploads/images
```

Sudden drop may indicate data loss; sudden spike may indicate abuse — check access logs.

---

## 5. MongoDB Atlas

Atlas dashboard:

- Cluster health green
- Connections below limit
- Backup job succeeded (last 24h)
- Alerts: CPU, disk, replication lag

Optional: Atlas alert → email when cluster down.

---

## 6. SMTP / email errors

Backend logs (`pm2 logs doughart-backend` or `backend/logs/pm2-error.log`):

```text
"type":"error","message":"[email] Failed to send"
"type":"error","message":"[email:smtp] send failed"
```

| Pattern | Meaning |
| --- | --- |
| `[email] Failed to send` | Order still saved; customer may not get email |
| SMTP auth errors | Check `SMTP_PASSWORD`, Gmail app password, firewall port 587 |

`EMAIL_PROVIDER=console` in production = misconfiguration (no real mail).

---

## 7. Public image upload errors (custom-cake reference images)

Log / API patterns:

| Symptom | Check |
| --- | --- |
| 400 upload validation | File type/size; see `imageValidation.ts` |
| 413 from Nginx | Increase `client_max_body_size` (6M in example config) |
| 503 API down | Health check, PM2, MongoDB |

Monitor rate limit hits on `/api/uploads/public/reference-image`.

---

## 8. Nginx / SSL

```bash
sudo nginx -t
sudo systemctl status nginx
sudo certbot certificates
```

Alert before certificate expiry (Certbot usually auto-renews).

---

## 9. Security signals

| Signal | Source |
| --- | --- |
| Failed admin logins | API logs / audit |
| Rate limit 429 spikes | Morgan JSON logs |
| Unusual order volume | Admin dashboard |

---

## 10. Daily / weekly routine

**Daily (5 min)**

- [ ] Health check green
- [ ] `pm2 status` all online
- [ ] Disk &lt; 80%

**Weekly (15 min)**

- [ ] Review PM2 error logs
- [ ] Atlas backup status
- [ ] Run `npm run smoke` against production API
- [ ] Spot-check one test order (staging or prod)

---

## Related

- [RUNBOOK.md](./RUNBOOK.md)
- [SMOKE_TESTS.md](./SMOKE_TESTS.md)
- [BACKUP.md](./BACKUP.md)
