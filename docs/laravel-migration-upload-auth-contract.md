# Laravel Migration Upload And Auth Contract

## Auth Contract

Current backend uses JWT from either cookie or Bearer header.

Source: `backend/middleware/auth.middleware.js`.

```text
Authorization: Bearer <token>
cookie fallback: la_admin_token
invalid/missing token: JSON error
req.user includes id, name, email, role, branch_id
req.branchId defaults to user.branch_id
student users include student profile fields when available
```

Laravel decision:

- Use Sanctum personal access tokens first.
- Preserve `Authorization: Bearer <token>` for Vite portals.
- Preserve compatible `/api/v1/auth/me` response shape.
- Do not force cookie-based Sanctum SPA auth in the first migration.

## Header Contract

| Header | Used By | Laravel Behavior |
| --- | --- | --- |
| `Authorization: Bearer <token>` | Admin, accounting, student portals, uploads | Authenticate Sanctum token |
| `X-Branch-Id` | Admin and accounting portals | Apply branch scope after permission check |
| `x-device-id` | Student portal | Preserve device/premium checks |
| `Origin` | CORS | Allow configured website and portal origins |

## CORS Contract

Current allowed origins include local Next/Vite ports and production domains.

Laravel must allow:

```text
http://localhost:3000
http://localhost:3001
http://localhost:5173
http://localhost:5174
http://localhost:5175
http://localhost:5176
http://localhost:5177
http://localhost:5178
http://127.0.0.1:3000
http://127.0.0.1:3001
http://127.0.0.1:5173
http://127.0.0.1:5174
http://127.0.0.1:5175
http://127.0.0.1:5176
http://127.0.0.1:5177
http://127.0.0.1:5178
https://darkslateblue-cormorant-104679.hostingersite.com
https://languageacademy.com.bd
https://www.languageacademy.com.bd
```

## Upload Contract

Current public static folders from `backend/server.js`:

```text
/uploads/courses    public static, cached 1 day
/uploads/branches   public static, cached 1 day
/uploads/resources  public static, cached 1 day
/uploads/blogs      public static, cached 1 day
```

Current protected fallback:

```text
/uploads/* requires Authorization Bearer token or ?token= query token
```

Laravel must preserve existing URL paths. Do not switch frontend-visible URLs to `/storage/...` during initial migration.

Phase 8 implementation:

- `backend-laravel/app/Http/Controllers/UploadController.php`
- `backend-laravel/routes/web.php`
- Public directories remain unauthenticated: `courses`, `branches`, `resources`, `blogs`.
- Generic `/uploads/*` fallback requires a Sanctum Bearer token or `?token=` query token.
- Lookup order is `backend-laravel/public/uploads`, optional `LEGACY_UPLOADS_PATH`, then existing `backend/uploads`.
- Responses use one-day public caching for served files.

## Upload Field Map

| Feature | Route | Form Field | Stored URL Pattern |
| --- | --- | --- | --- |
| Course image | `/api/lms/courses/upload-image` | `image` | `/uploads/courses/<file>` |
| Website course image | `/api/website/courses/upload-image` | `image` | `/uploads/courses/<file>` |
| Blog image | `/api/website/blogs/upload-image` | `image` | `/uploads/blogs/<file>` |
| Resource file | `/api/website/resources/upload` | `file` | `/uploads/resources/<file>` |
| Branch image | `/api/branches/:id/upload-image` | `image` | `/uploads/branches/<file>` |
| Asset image | `/api/assets` and `/api/assets/:id` | `image` | `/uploads/assets/<file>` |
| Expense receipt | `/api/expenses` and `/api/expenses/:id` | `receipt` | `/uploads/expenses/<file>` |
| Student photo | `/api/students/:id/photo` | `photo` | `/uploads/<file>` |
| HR document | `/api/hrm/documents` | `file` | `/uploads/<file>` |

## Laravel Storage Rule

Recommended initial implementation:

```text
Keep files physically compatible with current backend/uploads layout.
Serve /uploads public subfolders directly from web server or Laravel route.
Protect generic /uploads fallback with token middleware.
Return the same /uploads/... URL strings from API responses.
```

Do not introduce S3 or `/storage` public URLs until after cutover.

Phase 8 tests live in `backend-laravel/tests/Feature/Phase8UploadCompatibilityTest.php`.
