# Laravel Migration Route Map

Source: `backend/server.js` and `backend/routes/*.routes.js`.

Target rule: old `/api/<group>` becomes `/api/v1/<group>` unless a compatibility route is required during cutover.

Phase 7 cutover bridge: legacy `/api/*` requests are forwarded inside Laravel to `/api/v1/*` by `backend-laravel/app/Http/Controllers/Api/LegacyApiForwardController.php`. This avoids changing the existing Vite portal and Next.js fetch paths before data-backed parity verification is complete.

## Route Groups

| Old Base | Route File | Handler Count | Laravel Target | Migration Phase |
| --- | --- | ---: | --- | --- |
| `/api/auth` | `auth.routes.js` | 7 | `/api/v1/auth` | Phase 1 |
| `/api/crm` | `crm.routes.js` | 34 | `/api/v1/crm` | Phase 5 |
| `/api/lms` | `lms.routes.js` | 11 | `/api/v1/lms` | Phase 2 |
| `/api/branches` | `branch.routes.js` | 13 | `/api/v1/branches` | Phase 1 |
| `/api/accounting` | `accounting.routes.js` | 6 | `/api/v1/accounting` | Phase 3 |
| `/api/reconciliation` | `reconciliation.routes.js` | 21 | `/api/v1/reconciliation` | Phase 3 |
| `/api/pte` | `pte.routes.js` | 4 | `/api/v1/pte` | Phase 2 |
| `/api/students` | `student.routes.js` | 12 | `/api/v1/students` | Phase 2 |
| `/api/student` | `student.routes.js` | 12 | `/api/v1/student` compatibility alias | Phase 2 |
| `/api/attendance` | `attendance.routes.js` | 4 | `/api/v1/attendance` | Phase 2 |
| `/api/enrollments` | `enrollment.routes.js` | 2 | `/api/v1/enrollments` | Phase 2 |
| `/api/pos` | `pos.routes.js` | 5 | `/api/v1/pos` | Phase 3 |
| `/api/finance` | `finance.routes.js` | 11 | `/api/v1/finance` | Phase 3 |
| `/api/erp` | `erp.routes.js` | 5 | `/api/v1/erp` | Phase 6 |
| `/api/schedule` | `schedule.routes.js` | 1 | `/api/v1/schedule` | Phase 2 |
| `/api/notifications` | `notification.routes.js` | 3 | `/api/v1/notifications` | Phase 5 |
| `/api/dashboard` | `dashboard.routes.js` | 1 | `/api/v1/dashboard` | Phase 6 |
| `/api/payroll` | `payroll.routes.js` | 19 | `/api/v1/payroll` | Phase 4 |
| `/api/materials` | `material.routes.js` | 4 | `/api/v1/materials` | Phase 2 |
| `/api/assets` | `asset.routes.js` | 5 | `/api/v1/assets` | Phase 3 |
| `/api/reports` | `report.routes.js` | 3 | `/api/v1/reports` | Phase 6 |
| `/api/automation` | `automation.routes.js` | 6 | `/api/v1/automation` | Phase 5 |
| `/api/invoices` | `invoice.routes.js` | 15 | `/api/v1/invoices` | Phase 3 |
| `/api/expenses` | `expense.routes.js` | 14 | `/api/v1/expenses` | Phase 3 |
| `/api/budget` | `budget.routes.js` | 3 | `/api/v1/budget` | Phase 3 |
| `/api/public` | `public.routes.js` | 15 | `/api/v1/public` | Phase 6 |
| `/api/payment` | `payment.routes.js` | 7 | `/api/v1/payment` | Phase 3 |
| `/api/website` | `website.routes.js` | 13 | `/api/v1/website` | Phase 6 |
| `/api/hrm` | `hrm.routes.js` | 39 | `/api/v1/hrm` | Phase 4 |
| `/api/rbac` | `rbac.routes.js` | 2 | `/api/v1/rbac` | Phase 1 |
| `/api/settings` | `settings.routes.js` | 2 | `/api/v1/settings` | Phase 1 |

## Critical Phase 1 Endpoints

These must be captured as golden API contracts before implementation.

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/staff
PATCH /api/auth/role
PATCH /api/auth/staff-password
GET  /api/branches
GET  /api/settings
PUT  /api/settings
GET  /api/rbac/config
PUT  /api/rbac/config
```

## Implemented Phase 2 Endpoints

These Laravel routes are wired and covered by `backend-laravel/tests/Feature/Phase2AcademicSurfaceTest.php`.

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

## Implemented Phase 3 Route Groups

These Laravel route groups are wired and covered by `backend-laravel/tests/Feature/Phase3FinanceSurfaceTest.php`.

```text
/api/v1/accounting/*
/api/v1/finance/*
/api/v1/invoices/*
/api/v1/expenses/*
/api/v1/budget/*
/api/v1/assets/*
/api/v1/pos/*
/api/v1/reconciliation/*
/api/v1/payment/*
```

Payment remains demo-only. Do not add Stripe during this migration.

## Implemented Phase 4 Route Groups

These Laravel route groups are wired and covered by `backend-laravel/tests/Feature/Phase4HrmPayrollSurfaceTest.php`.

```text
/api/v1/hrm/*
/api/v1/payroll/*
```

## Implemented Phase 5 Route Groups

These Laravel route groups are wired and covered by `backend-laravel/tests/Feature/Phase5CrmAutomationSurfaceTest.php`.

```text
/api/v1/crm/*
/api/v1/automation/*
/api/v1/notifications/*
```

## Implemented Phase 6 Route Groups

These Laravel route groups are wired and covered by `backend-laravel/tests/Feature/Phase6PublicWebsiteReportErpSurfaceTest.php`.

```text
/api/v1/public/*
/api/v1/website/*
/api/v1/dashboard/*
/api/v1/reports/*
/api/v1/erp/*
```

Public routes remain unauthenticated. Website, dashboard, report, and ERP routes remain protected by Sanctum Bearer-token auth.

## Implemented Phase 7 Legacy Bridge

The following old frontend path style remains supported during cutover:

```text
/api/{legacyPath} -> /api/v1/{legacyPath}
```

The bridge is internal and non-redirecting, so POST bodies, upload files, Bearer tokens, `X-Branch-Id`, and `x-device-id` stay on the same request path from the frontend perspective. Unknown `/api/v1/*` paths are not forwarded again, preventing recursive fallback.

Covered by `backend-laravel/tests/Feature/Phase7LegacyApiCompatibilityTest.php`.

## Implemented Phase 8 Upload Route

Uploads are outside the `/api/*` namespace, so they are not covered by the Phase 7 API bridge. Laravel now serves compatible upload URLs directly:

```text
GET /uploads/{path}
```

Public subfolders are unauthenticated: `/uploads/courses/*`, `/uploads/branches/*`, `/uploads/resources/*`, and `/uploads/blogs/*`. Other upload paths require a Sanctum Bearer token or `?token=` query token.

Covered by `backend-laravel/tests/Feature/Phase8UploadCompatibilityTest.php`.

## Public Website Endpoints

```text
GET  /api/public/tracking-config
GET  /api/public/branches
GET  /api/public/branches/:slug
GET  /api/public/branches/:slug/courses
GET  /api/public/branches/:slug/blog
GET  /api/public/courses
GET  /api/public/courses/:slug
GET  /api/public/courses/:slug/batches
GET  /api/public/blog
GET  /api/public/blog/:slug
GET  /api/public/resources
GET  /api/public/resources/:slug
POST /api/public/contact
POST /api/public/enquiries
POST /api/public/student-bookings
```

## Demo Payment Endpoints

Payment stays demo-only in this migration. Do not add Stripe.

```text
GET  /api/payment/config
POST /api/payment/initiate
POST /api/payment/success
POST /api/payment/fail
POST /api/payment/cancel
GET  /api/payment/status/:reference
POST /api/payment/simulate
```

## Route Migration Order

1. `/api/health`
2. `/api/public` read endpoints
3. `/api/auth`
4. `/api/branches`, `/api/settings`, `/api/rbac`
5. `/api/lms`, `/api/students`, `/api/student`, `/api/enrollments`, `/api/attendance`, `/api/schedule`, `/api/materials`, `/api/pte`
6. `/api/hrm`, `/api/payroll`
7. `/api/crm`, `/api/automation`, `/api/notifications`
8. `/api/accounting`, `/api/finance`, `/api/invoices`, `/api/expenses`, `/api/budget`, `/api/pos`, `/api/reconciliation`, `/api/assets`, `/api/payment`
9. `/api/website`, `/api/dashboard`, `/api/reports`, `/api/erp`
10. Phase 7 bridge: legacy `/api/*` -> `/api/v1/*`
11. Phase 8 uploads: `/uploads/{path}`
12. Phases 9-12: DB safety, golden contracts, frontend cutover, production readiness
