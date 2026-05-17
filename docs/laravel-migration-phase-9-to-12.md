# Laravel Migration Phases 9-12

This document covers the remaining cutover work after route-surface migration is complete.

## Phase 9: Safe MySQL Dev Copy

Goal: prove Laravel can use the copied MySQL database without touching production.

Commands:

```bash
php artisan migration:phase9-safe-db
php artisan migration:phase9-safe-db --connect
php artisan migration:phase9-safe-db --migrate-sanctum
```

Safety behavior:

- The command refuses production-like database names such as `prod`, `production`, or `live`.
- The database name must clearly include a safe hint such as `dev`, `copy`, `test`, `local`, `staging`, or `sandbox`.
- `--migrate-sanctum` runs only `personal_access_tokens`; it does not run schema migrations for legacy tables.
- Do not copy production credentials into documentation.

Phase 9 exit criteria:

- Safe DB command passes.
- `--connect` verifies database reachability.
- Sanctum migration exists on the copied DB.
- `POST /api/auth/login` works against a known test user in the copied DB.
- `GET /api/auth/me` works with the returned Bearer token.
- `X-Branch-Id` scoping is manually verified with at least one head-office super admin and one branch user.

## Phase 10: Golden Contract Parity

Goal: compare representative Node responses to Laravel responses before cutover.

List configured contracts:

```bash
php artisan migration:phase10-contracts --list
```

Compare live local servers:

```bash
php artisan migration:phase10-contracts --node=http://127.0.0.1:5000 --laravel=http://127.0.0.1:8000
```

Compare selected endpoints:

```bash
php artisan migration:phase10-contracts --node=http://127.0.0.1:5000 --laravel=http://127.0.0.1:8000 --endpoint=/api/public/courses --endpoint=/api/payment/config
```

Phase 10 exit criteria:

- Status codes match for configured representative endpoints.
- Top-level JSON type matches.
- Top-level object keys from Node exist in Laravel where applicable.
- Manual spot checks pass for authenticated route data shape, not just unauthenticated errors.
- Any mismatches are fixed in Laravel or explicitly documented as intentional.

## Phase 11: Frontend Cutover

Goal: point the website and portals at Laravel with minimal frontend churn.

Recommended approach:

- Use the Phase 7 `/api/*` bridge first. Existing frontend code can keep calling `/api/...`.
- Keep Vite portals as Vite React.
- For same-origin deployment, point the reverse proxy so `/api` and `/uploads` hit Laravel.
- For split-origin deployment, set portal API env vars to the Laravel origin.

Frontend smoke checklist:

- Public website loads courses, branches, blog, resources, contact form, trial class, booking, and demo payment config.
- Admin portal login, `/auth/me`, branch selector, staff list, website management, CRM, LMS, HRM, and settings load.
- Accounting portal finance, invoices, expenses, POS, reconciliation, assets, and reports load.
- Student portal login, profile, schedule, attendance, materials, and PTE routes load.
- Upload images/files still render from `/uploads/...`.
- 401 handling still clears local sessions and redirects to login where expected.

Phase 11 exit criteria:

- All frontend smoke checks pass against Laravel.
- No frontend code still depends on Node-only response shapes.
- Node remains available for rollback until production canary passes.

## Phase 12: Production Readiness

Goal: deploy Laravel safely with rollback and observability.

Pre-deploy checklist:

- Full project backup exists.
- MySQL backup exists.
- Laravel `.env` uses production-safe values and never points migration commands at production without an explicit release plan.
- `APP_ENV=production`, `APP_DEBUG=false`, and a real `APP_KEY` are set.
- `QUEUE_CONNECTION` and scheduler strategy are decided for automation jobs.
- Web server routes `/api`, `/uploads`, and Laravel public assets correctly.
- PHP extensions required by production are installed, including `pdo_mysql` and zip/unzip support for Composer operations.
- Logs are collected centrally or rotated on disk.
- Rollback points `/api` and `/uploads` back to Node if Laravel canary fails.

Verification commands:

```bash
php artisan route:list --path=api
php artisan route:list --path=uploads
php artisan test
```

Post-deploy canary:

- `GET /api/health`
- `GET /api/public/courses`
- `POST /api/auth/login` with a safe canary account
- `GET /api/auth/me` with the canary token
- `GET /uploads/courses/<known-file>`
- One protected admin route returns 200 with token and 401 without token

Phase 12 exit criteria:

- Canary passes.
- Error logs stay clean during first production traffic window.
- Rollback path has been tested or rehearsed.
- Node fallback is retired only after an agreed monitoring window.
