# DoughArt — Upload storage (production)

Catalog images and payment proofs are uploaded through the API. Storage is selected with `UPLOAD_PROVIDER`.

## Phase 1 strategy (single VPS)

- Keep `UPLOAD_PROVIDER=local` as the default.
- Use one VPS/server with persistent disk mounted to `backend/uploads/images/`.
- Back up this uploads folder regularly (together with MongoDB backups).
- Keep Cloudinary as an optional production upgrade.
- S3 is not implemented in this codebase.

## Providers

| Provider | `UPLOAD_PROVIDER` | Best for |
| --- | --- | --- |
| **Local disk** | `local` (default) | Development, single VPS with persistent volume |
| **Cloudinary** | `cloudinary` | Optional production upgrade (managed CDN, no disk on API) |
| **S3** | `s3` | Not implemented yet |

Only `uploads/images/.gitkeep` is committed. Uploaded files are **gitignored** when using local storage.

---

## Local development (`UPLOAD_PROVIDER=local`)

- Files are written to `backend/uploads/images/`
- MongoDB stores paths like `/uploads/images/{filename}.jpg`
- Served at `{API_URL}/uploads/images/{filename}`
- Frontend/admin resolve via `NEXT_PUBLIC_API_URL` + path (see `frontend/src/lib/media.ts`, `admin/src/lib/upload/path.ts`)

### VPS / single server (local in production)

1. **Persistent volume** — mount a host directory into the API process, e.g.:
   - Host: `/var/lib/sweetbite/uploads/images`
   - Container: `/app/backend/uploads/images`
2. **Permissions** — API user must read/write the directory.
3. **Backups** — include this folder in nightly backups.

```bash
rsync -a --delete /var/lib/sweetbite/uploads/images/ /backups/sweetbite/uploads/images/
```

### Nginx note (local uploads)

- If Nginx proxies API requests to the backend app, `/uploads/images/*` continues to work through the backend route.
- No provider migration is needed for Phase 1.
- Keep API process read/write access to the mounted uploads directory.

---

## Production Cloudinary (`UPLOAD_PROVIDER=cloudinary`)

Optional production upgrade when you do not want upload disk on the API server.

### Required env vars (backend `.env`)

```env
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=sweetbite
```

### Behavior

- Multer still receives the file locally for validation (max **5 MB**, magic-byte check).
- After validation, the file is uploaded to Cloudinary under folder `CLOUDINARY_FOLDER` (default `sweetbite`).
- MongoDB stores the **full `secure_url`** (HTTPS).
- API responses return `path`, `url`, and `deleteKey` (Cloudinary `public_id`).
- Delete removes the asset from Cloudinary when possible.
- Gallery lists resources in the configured folder.

### CORS / Next.js images

- Shop and admin already accept full `https://` URLs in image fields.
- `next.config` includes `res.cloudinary.com` for `<Image>` when used.

### Mixed / migrated catalogs

- **Existing** records with `/uploads/images/...` keep working (API still serves `/uploads` for local files).
- **New** uploads use Cloudinary URLs when `UPLOAD_PROVIDER=cloudinary`.
- Optional migration: re-upload catalog images via admin gallery, or run a one-off script to push local files to Cloudinary and update MongoDB paths.

---

## Storage abstraction (backend)

`backend/src/services/storage/`:

| Method | Purpose |
| --- | --- |
| `uploadFile` | Persist validated file; return stored path + public URL |
| `deleteFile` | Remove by provider key (`filename` or Cloudinary `public_id`) |
| `getPublicUrl` | Resolve stored value to a client URL |
| `listGalleryFiles` | Admin gallery listing |

Local provider behavior is unchanged from pre-P2A (paths under `/uploads/images/`).

---

## Security (implemented)

- Max file size: **5 MB** (`backend/src/config/upload.ts`)
- Allowed types: JPG, JPEG, PNG, WebP, GIF, HEIC, HEIF
- Extension + MIME + magic-byte validation (`imageValidation.ts`)
- Rate limit on upload routes (`uploadLimiter`)
- Public payment proof: `POST /api/uploads/public/payment-proof` only
- Admin catalog images: JWT required

## Related docs

- [PRODUCTION_LAUNCH.md](./PRODUCTION_LAUNCH.md) — full deploy checklist
- [DEPLOYMENT.md](./DEPLOYMENT.md) — env and security summary
