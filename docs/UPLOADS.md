# DoughArt — Upload storage (production)

Catalog images and custom-cake reference images are uploaded through the API. Storage is selected with `UPLOAD_PROVIDER`.

**Public Gallery is separate:** only images uploaded through Admin → Gallery become Gallery records. Product, category, logo, favicon, banner, review, and other shared uploads never appear in the public Gallery.

## Phase 1 strategy (single VPS)

- Keep `UPLOAD_PROVIDER=local` as the default.
- Use one VPS/server with persistent disk mounted to:
  - `backend/uploads/images/` (catalog / shared uploads)
  - `backend/uploads/gallery/` (dedicated Gallery uploads)
- Back up both uploads folders regularly (together with MongoDB backups).
- Keep Cloudinary as an optional production upgrade.
- S3 is not implemented in this codebase.

## Providers

| Provider | `UPLOAD_PROVIDER` | Best for |
| --- | --- | --- |
| **Local disk** | `local` (default) | Development, single VPS with persistent volume |
| **Cloudinary** | `cloudinary` | Optional production upgrade (managed CDN, no disk on API) |
| **S3** | `s3` | Not implemented yet |

Only `uploads/images/.gitkeep` and `uploads/gallery/.gitkeep` are committed. Uploaded files are **gitignored** when using local storage.

---

## Dedicated Gallery (required behaviour)

Gallery has its own:

| Layer | Local | Cloudinary |
| --- | --- | --- |
| Database | MongoDB `GalleryImage` collection | same |
| Storage namespace | `backend/uploads/gallery/` | `{CLOUDINARY_FOLDER}/gallery` |
| Public URL prefix | `/uploads/gallery/{filename}` | Cloudinary `secure_url` |

### Gallery API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/gallery/public` | none | Public Gallery list (safe fields only) |
| `GET` | `/api/gallery` | Admin JWT | Admin Gallery list |
| `POST` | `/api/gallery` | Admin JWT | Upload Gallery image + create DB record |
| `DELETE` | `/api/gallery/:id` | Admin JWT | Delete by Gallery DB id only |

Public responses include only safe fields such as `id`, `filename`, `url`, `size`, `mimeType`, `altText`, `createdAt`.

Public responses **never** include `storageKey`, Cloudinary public IDs, or delete keys.

### What does **not** appear in Gallery

- Product / menu images (`POST /api/uploads/image`)
- Category images
- Logo / hero / settings branding
- Review images
- Custom-cake reference images (`POST /api/uploads/public/reference-image`)
- Static frontend assets (`frontend/public/images/real/...`)
- Every file in Cloudinary or `uploads/images`

### Existing mixed uploads

Older environments may still have many files in the shared catalog folder that previously appeared in Gallery via storage listing.

Those files:

- remain untouched in storage
- are **not** automatically migrated into `GalleryImage`
- no longer appear in Admin or public Gallery
- must be re-uploaded intentionally via Admin → Gallery if they should be shown

---

## Local development (`UPLOAD_PROVIDER=local`)

### Catalog / shared uploads

- Files are written to `backend/uploads/images/`
- MongoDB stores paths like `/uploads/images/{filename}.jpg`
- Served at `{API_URL}/uploads/images/{filename}`

### Dedicated Gallery uploads

- Files are written to `backend/uploads/gallery/`
- MongoDB `GalleryImage` stores `/uploads/gallery/{filename}.jpg` plus an internal `storageKey`
- Served at `{API_URL}/uploads/gallery/{filename}`

Frontend/admin resolve via `NEXT_PUBLIC_API_URL` + path (see `frontend/src/lib/media.ts`, `admin/src/lib/upload/path.ts`).

### VPS / single server (local in production)

1. **Persistent volume** — mount host directories into the API process, e.g.:
   - Host: `/var/lib/doughart/uploads/images` → Container: `/app/backend/uploads/images`
   - Host: `/var/lib/doughart/uploads/gallery` → Container: `/app/backend/uploads/gallery`
2. **Permissions** — API user must read/write both directories.
3. **Backups** — include both folders in nightly backups.

```bash
rsync -a --delete /var/lib/doughart/uploads/images/ /backups/doughart/uploads/images/
rsync -a --delete /var/lib/doughart/uploads/gallery/ /backups/doughart/uploads/gallery/
```

### Nginx note (local uploads)

- If Nginx proxies API requests to the backend app, `/uploads/images/*` and `/uploads/gallery/*` continue to work through the backend routes.
- No provider migration is needed for Phase 1.
- Keep API process read/write access to the mounted uploads directories.

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
- After validation:
  - Catalog uploads go to folder `CLOUDINARY_FOLDER` (default `sweetbite`)
  - Gallery uploads go to folder `CLOUDINARY_FOLDER/gallery` (e.g. `sweetbite/gallery`)
- Catalog MongoDB fields store the **full `secure_url`** (HTTPS).
- Gallery MongoDB records store the URL plus an internal `storageKey` (Cloudinary `public_id`).
- Gallery delete uses the server-side `storageKey` from the Gallery record — never a client-supplied public ID.
- Gallery list always comes from MongoDB `GalleryImage` records — never from listing the whole Cloudinary account.

### CORS / Next.js images

- Shop and admin already accept full `https://` URLs in image fields.
- `next.config` includes `res.cloudinary.com` for `<Image>` when used.

### Mixed / migrated catalogs

- **Existing** records with `/uploads/images/...` keep working (API still serves `/uploads` for local files).
- **New** catalog uploads use Cloudinary URLs when `UPLOAD_PROVIDER=cloudinary`.
- Gallery does **not** auto-import historical shared uploads.

---

## Storage abstraction (backend)

`backend/src/services/storage/`:

| Method | Purpose |
| --- | --- |
| `uploadFile` | Persist validated file; optional `namespace: "gallery"` for dedicated Gallery |
| `deleteFile` | Remove by provider key (`filename`, `gallery/{filename}`, or Cloudinary `public_id`) |
| `getPublicUrl` | Resolve stored value to a client URL |
| `listGalleryFiles` | **Deprecated** mixed shared-folder listing — not used by public Gallery |

Local provider behavior for catalog paths under `/uploads/images/` is unchanged.

---

## Compatibility routes

These older paths remain for compatibility but now return dedicated `GalleryImage` records only:

- `GET /api/uploads/gallery`
- `GET /api/uploads/public/gallery`

Prefer:

- `GET /api/gallery`
- `GET /api/gallery/public`

Shared catalog upload/delete remain:

- `POST /api/uploads/image`
- `DELETE /api/uploads/image/:filename`
- `POST /api/uploads/public/reference-image`

---

## Security (implemented)

- Max file size: **5 MB** (`backend/src/config/upload.ts`)
- Allowed types: JPG, JPEG, PNG, WebP, GIF, HEIC, HEIF (SVG not accepted)
- Extension + MIME + magic-byte validation (`imageValidation.ts`)
- Rate limit on upload routes (`uploadLimiter`)
- Public reference image: `POST /api/uploads/public/reference-image` only
- Admin catalog images: JWT required
- Admin Gallery upload/delete: JWT required
- Gallery delete is by database ID only (no arbitrary storage path from the browser)
- Public Gallery response excludes internal storage keys

## Related docs

- [PRODUCTION_LAUNCH.md](./PRODUCTION_LAUNCH.md) — full deploy checklist
- [DEPLOYMENT.md](./DEPLOYMENT.md) — env and security summary
