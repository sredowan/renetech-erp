# Language Academy Laravel API Migration

This is the new Laravel 12 API skeleton for migrating the existing Node/Express backend.

## Current Status

- Laravel 12 installed in `backend-laravel/`.
- Sanctum installed for Bearer token auth compatibility.
- API health endpoint available at `/api/v1/health`.
- App timezone set to `Asia/Dhaka`.
- CORS config mirrors the current Node backend allowed origins.
- `.env.example` defaults to MySQL placeholders for a dev database copy.
- Phase 1 auth/admin settings surface is implemented under `/api/v1/*`.
- Phase 2 academic surface is implemented under `/api/v1/*` for LMS, students, enrollments, attendance, schedule, materials, and PTE.
- Phase 3 finance/payment surface is implemented under `/api/v1/*` for accounting, finance, invoices, expenses, budget, assets, POS, reconciliation, and demo payment.
- Phase 4 HRM/payroll surface is implemented under `/api/v1/*` for HRM self-service, attendance, leave, recruitment, documents, reviews, shifts, schedules, dashboard, payroll profiles, bonuses, deductions, teacher sessions, generation, and payment marking.
- Phase 5 CRM/automation/notification surface is implemented under `/api/v1/*` for leads, contacts, opportunities, CRM activities, campaigns, CRM analytics, automation rules, birthday checks, and notifications.
- Phase 6 public/website/dashboard/report/ERP surface is implemented under `/api/v1/*` for public website reads and submissions, website content management, dashboard stats, reports, rooms, and room bookings.
- Phase 7 legacy API compatibility bridge is implemented. Existing `/api/*` frontend calls are internally forwarded to `/api/v1/*` without HTTP redirects.
- Phase 8 upload URL compatibility is implemented. `/uploads/courses`, `/uploads/branches`, `/uploads/resources`, and `/uploads/blogs` remain public; other `/uploads/*` files require a Bearer or query token.
- Phases 9-12 cutover support is implemented as safety commands and operational checklists for safe DB verification, golden contract comparison, frontend cutover, and production readiness.
- Laravel's default `create_users_table` migration was removed because the existing MySQL database already owns `users`.
- Laravel's default cache/jobs migrations were removed for now. Initial session, queue, and cache drivers use file/sync drivers to avoid unrelated DB tables during parity work.
- Tests pass: `php artisan test` currently reports `31 passed (401 assertions)`.
- Route list verification currently reports `278` `/api/v1/*` routes plus one legacy `/api/{legacyPath}` bridge route.

## Safety Rules

- Do not connect this app to production MySQL until schema parity is verified.
- Do not run Laravel migrations against production during foundation work.
- Preserve existing frontend API behavior first; refactor later.
- Keep Vite React portals as Vite React.
- Payments stay demo-only; do not add Stripe.

## Known Local Environment Caveats

- PHP zip extension or unzip/7z is missing, so Composer falls back to source installs.
- SQLite PHP driver is missing, so Laravel's create-project migration warning is expected.
- MySQL setup should use a copied/dev DB before any live database access.

## Verified Commands

```bash
php artisan route:list --path=api/v1
php artisan test
```

## Next Implementation Step

Phase 7 is cutover-bridge complete. Next work should move from surface parity to data-backed verification:

1. Configure a safe MySQL dev copy and run only the Sanctum token migration there.
2. Capture golden Node responses for representative `/api/public`, `/api/website`, `/api/dashboard`, `/api/reports`, and `/api/erp` endpoints.
3. Compare Laravel responses against the golden contracts using the copied database.
4. Add data-backed response tests once the local PHP MySQL/SQLite test driver is available.

## Phase 1 Implemented Surface

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/register
GET  /api/v1/auth/staff
PATCH /api/v1/auth/role
PATCH /api/v1/auth/staff-password
GET  /api/v1/branches
GET  /api/v1/rbac/config
PUT  /api/v1/rbac/config
GET  /api/v1/settings
PUT  /api/v1/settings
```

Successful auth still needs a safe MySQL dev copy plus the Sanctum `personal_access_tokens` migration.

## Phase 2 Implemented Surface

```text
GET    /api/v1/lms/batches
POST   /api/v1/lms/batches
GET    /api/v1/lms/batches/{id}
PUT    /api/v1/lms/batches/{id}
GET    /api/v1/lms/batches/{id}/students
POST   /api/v1/lms/batches/{id}/notify
PATCH  /api/v1/lms/batches/{id}/status
GET    /api/v1/lms/courses
POST   /api/v1/lms/courses
PUT    /api/v1/lms/courses/{id}
POST   /api/v1/lms/courses/upload-image
GET    /api/v1/students
POST   /api/v1/students
PUT    /api/v1/students/me
POST   /api/v1/students/enroll
GET    /api/v1/students/{id}
PUT    /api/v1/students/{id}
PUT    /api/v1/students/{id}/photo
GET    /api/v1/students/{id}/activities
POST   /api/v1/students/{id}/activities
PATCH  /api/v1/students/{id}/management
PATCH  /api/v1/students/{id}/success-record
POST   /api/v1/students/{id}/request-partner-access
PUT    /api/v1/student/me
GET    /api/v1/enrollments
POST   /api/v1/enrollments
GET    /api/v1/attendance/student/me
POST   /api/v1/attendance/mark
GET    /api/v1/attendance/batch
GET    /api/v1/attendance/student/{student_id}
GET    /api/v1/schedule
GET    /api/v1/materials/batch/{batch_id}
POST   /api/v1/materials
DELETE /api/v1/materials/{id}
POST   /api/v1/materials/share
GET    /api/v1/pte/tasks
POST   /api/v1/pte/attempts
GET    /api/v1/pte/performance
GET    /api/v1/pte/performance/branch
```

Phase 2 route registration and unauthenticated Bearer-token protection are covered by `tests/Feature/Phase2AcademicSurfaceTest.php`.

## Phase 3 Implemented Surface

- `/api/v1/accounting/*`
- `/api/v1/finance/*`
- `/api/v1/invoices/*`
- `/api/v1/expenses/*`
- `/api/v1/budget/*`
- `/api/v1/assets/*`
- `/api/v1/pos/*`
- `/api/v1/reconciliation/*`
- `/api/v1/payment/*`

Phase 3 route registration and unauthenticated Bearer-token protection are covered by `tests/Feature/Phase3FinanceSurfaceTest.php`.

Payment remains demo-compatible only. No Stripe or external payment provider was added.

## Phase 4 Implemented Surface

- `/api/v1/hrm/*`
- `/api/v1/payroll/*`

Phase 4 route registration and unauthenticated Bearer-token protection are covered by `tests/Feature/Phase4HrmPayrollSurfaceTest.php`.

## Phase 5 Implemented Surface

- `/api/v1/crm/*`
- `/api/v1/automation/*`
- `/api/v1/notifications/*`

Phase 5 route registration and unauthenticated Bearer-token protection are covered by `tests/Feature/Phase5CrmAutomationSurfaceTest.php`.

## Phase 6 Implemented Surface

- `/api/v1/public/*`
- `/api/v1/website/*`
- `/api/v1/dashboard/*`
- `/api/v1/reports/*`
- `/api/v1/erp/*`

Phase 6 route registration, public unauthenticated route behavior, and protected Bearer-token requirements are covered by `tests/Feature/Phase6PublicWebsiteReportErpSurfaceTest.php`.

## Phase 7 Legacy Compatibility Bridge

Existing frontends still call legacy paths such as `/api/auth/login`, `/api/public/courses`, and `/api/website/blogs`. Laravel keeps canonical routes under `/api/v1/*`, then forwards legacy `/api/*` requests internally to the matching `/api/v1/*` route.

Implemented file:

- `app/Http/Controllers/Api/LegacyApiForwardController.php`

Covered behavior:

- `/api/health` forwards to `/api/v1/health` without a 301/302 redirect.
- Request method, body, query string, files, cookies, and headers are preserved for the forwarded request.
- Protected legacy paths keep the same Sanctum Bearer-token requirement as their `/api/v1/*` target.
- Unknown `/api/v1/*` paths return 404 and do not recurse through the legacy bridge.

Phase 7 compatibility is covered by `tests/Feature/Phase7LegacyApiCompatibilityTest.php`.

## Phase 8 Upload Compatibility

Existing frontend-visible upload URLs remain `/uploads/...`; Laravel does not expose `/storage/...` during migration.

Implemented file:

- `app/Http/Controllers/UploadController.php`

Covered behavior:

- `/uploads/courses/*`, `/uploads/branches/*`, `/uploads/resources/*`, and `/uploads/blogs/*` are public and cacheable for one day.
- Other `/uploads/*` paths return `401` without a token, matching the Node protected fallback behavior.
- Protected uploads accept `Authorization: Bearer <sanctum-token>` or `?token=<sanctum-token>`.
- Upload lookup checks Laravel's `public/uploads` first, then optional `LEGACY_UPLOADS_PATH`, then the existing Node `backend/uploads` folder.
- Path traversal attempts are rejected.

Phase 8 upload behavior is covered by `tests/Feature/Phase8UploadCompatibilityTest.php`.

## Phases 9-12 Cutover Support

Executable commands:

```bash
php artisan migration:phase9-safe-db
php artisan migration:phase9-safe-db --connect
php artisan migration:phase9-safe-db --migrate-sanctum
php artisan migration:phase10-contracts --list
php artisan migration:phase10-contracts --node=http://127.0.0.1:5000 --laravel=http://127.0.0.1:8000
```

Implemented files:

- `app/Console/Commands/Phase9SafeDbCommand.php`
- `app/Console/Commands/Phase10ContractCompareCommand.php`
- `config/migration_contracts.php`
- `docs/laravel-migration-phase-9-to-12.md`

Command behavior is covered by `tests/Feature/Phase9To10CutoverCommandTest.php`.
