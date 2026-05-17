# Laravel Migration Phase -1 Audit

This document locks the safety baseline before creating `backend-laravel` or touching the MySQL schema.

## Current State

- Git state: this folder is not a Git repository. `git rev-parse --show-toplevel` fails with `not a git repository`.
- Backend runtime: Node.js, Express 5, Sequelize 6, MySQL.
- Public website: Next.js app in `website/`.
- Portals: Vite React apps remain Vite React during the Laravel migration.
- Target backend: Laravel 12 REST API under `/api/v1/*`.
- Database rule: existing MySQL is read-only during model parity work.
- Payment rule: demo payment flow only. Do not add Stripe.

## Inventory Summary

| Area | Actual Count | Source |
| --- | ---: | --- |
| Express route files | 30 | `backend/routes/*.routes.js` |
| Route handlers | 287 | `router.get/post/put/patch/delete` matches |
| Controllers | 30 | `backend/controllers/*.controller.js` |
| Sequelize model files | 61 | `backend/models/*.js` |
| Middleware | 5 | `backend/middleware/*.js` |
| Services | 4 | `backend/services/*.js` |

## Non-Negotiable Safety Rules

1. Back up the full project folder before implementation work.
2. Back up MySQL before Laravel connects to the database.
3. Laravel connects to a copied/dev database first.
4. Do not run Laravel migrations against production until schema parity is verified.
5. Do not change Vite portals during backend Phase 0 and Phase 1 except API URL config if needed.
6. Preserve existing `Authorization: Bearer <token>` behavior for portals.
7. Preserve `X-Branch-Id` and `x-device-id` headers.
8. Preserve `/uploads/...` URLs and public/protected behavior.
9. Capture Node golden API responses before replacing each route group.
10. Keep Node backend available as rollback until all route groups pass tests.

## Target Cutover Shape

```text
Next.js website
React/Vite portals
        |
        v
Laravel 12 API /api/v1/*
        |
        v
Existing MySQL

Fallback during migration:
Frontends -> old Node /api/*
```

## Phase -1 Deliverables

- `docs/laravel-migration-route-map.md`
- `docs/laravel-migration-schema-map.md`
- `docs/laravel-migration-api-contracts.md`
- `docs/laravel-migration-upload-auth-contract.md`

## Ready For Phase 0 When

- MySQL backup exists.
- Schema-only export exists.
- Golden responses exist for critical endpoints.
- Laravel database user is configured for copied/dev DB first.
- No production DB credentials are copied into documentation.
