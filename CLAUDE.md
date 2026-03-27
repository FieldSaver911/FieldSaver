# FieldSaver Form Builder — Claude Code Instructions

## Project Overview

FieldSaver is a full-stack web application for building, managing, and submitting NEMSIS v3.5-compliant EMS data collection forms. It integrates with monday.com and supports a unified data library system.

**Architecture:** Monorepo with three layers:
- `backend/` — Node.js + Express REST API + PostgreSQL
- `frontend/` — React 18 SPA (migrated from the single-file artifact)
- `shared/` — TypeScript types shared by both layers

**Tech Stack:**
@docs/tech-stack.md

**Architecture Decisions:**
@docs/architecture.md

---

## Repository Layout

```
fieldsaver/
├── backend/
│   ├── src/
│   │   ├── api/          # Express route handlers (one file per resource)
│   │   ├── db/           # Knex migrations, seeds, queries
│   │   ├── services/     # Business logic (FormService, LibraryService, etc.)
│   │   ├── middleware/   # auth, validation, error handling
│   │   └── app.ts        # Express app factory
│   ├── tests/
│   └── knexfile.ts
├── frontend/
│   ├── src/
│   │   ├── components/   # React components (mirrors spec sections)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── api/          # API client (typed fetch wrappers)
│   │   ├── stores/       # Zustand stores (form state, library state)
│   │   ├── types/        # Re-exports from shared/
│   │   └── main.tsx
│   └── vite.config.ts
├── shared/
│   └── src/
│       └── types/        # Form, Field, Library, LibraryRow, etc.
├── .claude/
│   ├── agents/           # Specialized subagents
│   ├── skills/           # Reusable skill workflows
│   └── rules/            # Path-scoped coding rules
└── CLAUDE.md             # This file
```

---

## Build & Run Commands

```bash
# Install all workspaces
npm install

# Database
npm run db:migrate          # Run pending migrations
npm run db:migrate:rollback # Roll back last batch
npm run db:seed             # Seed NEMSIS library data
npm run db:reset            # Drop + migrate + seed (dev only)

# Development
npm run dev                 # Start backend + frontend concurrently
npm run dev:backend         # Backend only (port 3001)
npm run dev:frontend        # Frontend only (port 5173)

# Tests
npm test                    # All tests
npm run test:backend        # Backend unit + integration
npm run test:frontend       # Frontend component + hook tests
npm run test:e2e            # Playwright end-to-end

# Build
npm run build               # Production build of both layers
npm run build:backend
npm run build:frontend

# Lint / Type-check
npm run lint                # ESLint across all packages
npm run typecheck           # tsc --noEmit across all packages
```

---

## Coding Standards

### TypeScript
- Strict mode enabled (`strict: true` in all tsconfigs)
- No `any` — use `unknown` and narrow with type guards
- Prefer `interface` over `type` for object shapes; use `type` for unions/intersections
- All API response types defined in `shared/src/types/api.ts`
- All database row types defined in `shared/src/types/db.ts`

### Backend
- Route handlers in `src/api/` — thin, delegate to services
- Services in `src/services/` — all business logic lives here
- No raw SQL — use Knex query builder or typed query helpers in `src/db/queries/`
- Every route validates its input with `zod` before touching the DB
- Use `next(err)` for all error propagation — never `res.json({ error })` directly
- Return HTTP status codes correctly: 200/201/204 for success, 400/404/422/500 for errors
- All routes are authenticated unless explicitly in the `PUBLIC_ROUTES` list

### Frontend
- Functional components only — no class components
- All JSX-returning functions are top-level `function` declarations (no `const X = () => JSX` — this breaks the Babel standalone environment we may still target)
- No IIFEs in component bodies
- No `useState` inside `.map()` callbacks — extract to a named component
- Use Zustand for cross-component state; `useState` for purely local UI state
- Fetch via the typed API client in `src/api/` — never raw `fetch` in components
- All `useEffect` dependencies must be correct — ESLint exhaustive-deps is an error

### Shared
- Types in `shared/` must be pure TypeScript — no imports from backend or frontend
- Zod schemas live in `shared/src/schemas/` and are used for both runtime validation and type inference

### File naming
- `kebab-case` for all files and directories
- `PascalCase` for React component files: `FormBuilder.tsx`
- `camelCase` for non-component TypeScript files: `formService.ts`
- Test files mirror the source: `formService.test.ts`, `FormBuilder.test.tsx`

### Commit style
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- One logical change per commit
- Always run `npm run typecheck && npm run lint && npm test` before committing

---

## API Design Conventions

- Base URL: `/api/v1`
- All responses wrapped: `{ data: T, meta?: PaginationMeta }` for success; `{ error: string, details?: ZodError[] }` for errors
- Dates as ISO 8601 strings
- IDs as UUIDs (not auto-increment integers)
- Pagination: `?page=1&limit=50` with `meta.total`, `meta.page`, `meta.limit` in response
- Soft deletes for all user-created records (`deleted_at` column)

See @docs/api-conventions.md for full endpoint reference.

---

## Database Conventions

- All tables have: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at`, `updated_at`, `deleted_at`
- Foreign keys always have indexes
- Use `camelCase` in TypeScript, `snake_case` in the database — Knex transforms via `knex-stringcase`
- Migrations are named `YYYYMMDDHHMMSS_description.ts`
- Never alter existing migrations — always create a new one

---

## Environment Variables

Required in `.env` (never commit this file):
```
DATABASE_URL=postgresql://user:pass@localhost:5432/fieldsaver
JWT_SECRET=<32+ char random string>
MONDAY_CLIENT_ID=<from monday.com developer console>
MONDAY_CLIENT_SECRET=<from monday.com developer console>
MONDAY_APP_ID=<from monday.com developer console>
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

See `.env.example` for full list with descriptions.

---

## Key Domain Concepts

When working in this codebase, these terms have specific meanings:

- **Form** — the root container: pages → sections → rows → cells → fields
- **Field** — one data collection element with type, validation, behaviour, and library rows
- **Library** — a board/table of data elements; a Library IS a Board, a Row IS a data element
- **LibraryRow** — a row assigned to a field, carrying an `exportKey` used in JSON export
- **ExportKey** — the key output in the submission payload for this field (maps to NEMSIS element path)
- **Category** — a group within a library (NOT Value, Pertinent Negative, Data Element, Nillable Marker)
- **showCategories** — which category rows are surfaced as chips to the form respondent
- **NEMSIS** — National EMS Information System v3.5.1 — the EMS data standard this app targets

---

## When to Use Agents vs Skills

- Use **agents** for complex multi-file tasks: implementing a whole feature, debugging across layers, writing tests for an existing module
- Use **skills** for repeatable single-purpose workflows: scaffolding a new endpoint, running migrations, generating a component from a spec

---

---

## Important: Reference vs. Implementation Files

### ⚠️ HTML Files (REFERENCE ONLY)
**DO NOT EDIT** the following files — they are for reference/documentation only:
- `HTML/form-builder copy.html` — Legacy single-file artifact
- `HTML/form-builder.html` — Legacy reference implementation

These files are **outdated snapshots**. All real work happens in the monorepo structure:
- Frontend components live in `frontend/src/components/`
- Form state in `frontend/src/stores/`
- Form logic in `backend/src/services/`

If you're asked to work on form builder features, implement them in the proper monorepo structure, **not** in the HTML files.

---

## Related Files

- Full product spec: @docs/spec.md (if present) or see `fieldsaver-form-builder-spec.docx`
- API endpoint reference: @docs/api-conventions.md
- Database schema: @docs/schema.md
- NEMSIS data reference: @docs/nemsis-v35.md
