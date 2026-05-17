# Laravel Migration API Contracts

The Laravel API must match existing frontend expectations before a route group is cut over.

## Contract Capture Rule

For each route group, capture from Node first:

```text
request method
request path
request headers
request body sample
status code
response JSON shape
error JSON shape
auth requirement
branch/device header behavior
file upload field names, if any
```

Do not document real secrets, real passwords, or production tokens.

## Golden Contract Priority

### P0 Auth And Session

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
GET  /api/branches
GET  /api/settings
GET  /api/rbac/config
```

Required checks:

- Login response includes the token field expected by portals.
- User object includes `id`, `name`, `email`, `role`, and `branch_id` where available.
- Student auth includes student profile and premium fields where current API returns them.
- Invalid token returns the same status family and compatible error shape.

### P0 Public Website

```text
GET  /api/public/courses
GET  /api/public/courses/:slug
GET  /api/public/blog
GET  /api/public/blog/:slug
GET  /api/public/branches
POST /api/public/contact
POST /api/public/enquiries
POST /api/public/student-bookings
```

Required checks:

- Next.js server fetches can parse arrays directly where current code expects arrays.
- Image URLs remain `/uploads/...` or absolute URLs.
- Empty public arrays behave the same as Node fallbacks.

### P0 Money And Payment

```text
GET  /api/payment/config
POST /api/payment/initiate
POST /api/payment/simulate
GET  /api/payment/status/:reference
POST /api/invoices
PUT  /api/invoices/:id
POST /api/expenses
POST /api/pos/*
POST /api/reconciliation/*
```

Required checks:

- Demo payment only.
- No Stripe integration.
- Financial writes use database transactions in Laravel.
- Amounts preserve decimal precision.

## Frontend Client Expectations

### Phase 7 Cutover Bridge

Existing frontend code still calls legacy `/api/*` paths. During cutover, Laravel supports those paths with an internal bridge:

```text
/api/auth/login       -> /api/v1/auth/login
/api/public/courses   -> /api/v1/public/courses
/api/website/blogs    -> /api/v1/website/blogs
```

This is not an HTTP redirect. Request method, query string, body, files, cookies, and headers must be preserved so existing portal and website clients do not need immediate code changes.

### Admin Portal

Source: `admin-portal/src/services/api.js`.

```text
baseURL: VITE_API_URL or /api
withCredentials: true
Authorization: Bearer <localStorage token>
X-Branch-Id: <localStorage selectedBranch>
401/403 on /auth/me clears local session and redirects to /admin/login
```

### Accounting Portal

Source: `accounting-portal/src/services/api.js`.

```text
baseURL: /api
Authorization: Bearer <localStorage token>
X-Branch-Id: <localStorage selectedBranch>
```

### Student Portal

Source: `student-portal/src/services/api.js`.

```text
baseURL: /api
Authorization: Bearer <localStorage token>
x-device-id: <localStorage deviceId>
```

### Next.js Website

Sources: `website/src/lib/api.js`, `website/src/lib/serverApi.js`, `website/src/lib/imageUrl.js`.

```text
server API base: INTERNAL_API_URL, otherwise local port
fallback public base: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, PUBLIC_SITE_URL
public images: /uploads paths may be prefixed with NEXT_PUBLIC_UPLOADS_BASE_URL or NEXT_PUBLIC_API_URL
```

## Laravel Test Requirements

Every migrated route group needs tests before cutover:

```text
happy path
validation failure
unauthenticated request
unauthorized role
branch scoping
empty result
not found
database failure or rollback path for writes
```

For public website APIs, add tests for empty arrays and missing image files.

For financial APIs, add tests for transaction rollback and decimal precision.

For scheduled jobs, add duplicate-send prevention tests.
