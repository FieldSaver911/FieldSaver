# FieldSaver Form Builder — Claude Code Setup

This directory contains the complete Claude Code configuration for building FieldSaver
as a full-stack application. Drop the `.claude/` folder, `CLAUDE.md`, and `docs/` into
the root of your FieldSaver monorepo.

---

## Quick Start

### 1. Copy files into your repo
```bash
cp -r .claude/ /path/to/your/fieldsaver/
cp CLAUDE.md /path/to/your/fieldsaver/
cp -r docs/ /path/to/your/fieldsaver/
```

### 2. Open Claude Code
```bash
cd /path/to/your/fieldsaver
claude
```

### 3. Build the initial project structure
On first run, tell Claude Code:

> *"Read the CLAUDE.md and docs/, then scaffold the initial monorepo structure — create the package.json workspaces, tsconfigs, backend Express app, frontend Vite app, and shared types package. Don't implement any features yet, just the skeleton."*

### 4. Build features using agents and skills

**Scaffold an entire feature:**
```
/scaffold-feature authentication "JWT login, registration, refresh tokens"
/scaffold-feature forms "full CRUD for forms with pages/sections/fields"
/scaffold-feature libraries "CRUD for data libraries and library rows"
/scaffold-feature submissions "form submission with NEMSIS export"
/scaffold-feature monday-integration "monday.com OAuth and item sync"
```

**Target a specific layer:**
```
Use the backend-architect agent to add a POST /forms/:id/duplicate endpoint
Use the frontend-engineer agent to build the UnifiedLibraryBrowser component
Use the database-engineer agent to optimize the library_rows queries
```

**Shortcuts:**
```
/generate-api-endpoint POST /forms/:id/publish publishes a draft form
/generate-frontend-component LibraryBadge "shows category color and name"
/generate-test-suite backend/src/services/form-service.ts
/run-migrations
/seed-library-data
/deploy-check
/review-pr 42
/fix-bug "library rows not showing after category filter is applied"
/audit-security
/sync-monday-schema 1234567890 "My Board"
```

---

## File Structure

```
.claude/
├── agents/                      # Specialized subagents
│   ├── backend-architect.md     # Express + Knex + services
│   ├── database-engineer.md     # Schema + migrations + queries
│   ├── devops-engineer.md       # Docker + CI/CD + infra
│   ├── frontend-engineer.md     # React + Zustand + Vite
│   ├── full-stack-debugger.md   # Cross-layer debugging
│   ├── integration-engineer.md  # monday.com API + OAuth
│   └── test-engineer.md         # Vitest + RTL + Playwright
│
├── skills/                      # Invokable workflows
│   ├── scaffold-feature/        # Full-stack feature in one pass
│   ├── generate-api-endpoint/   # Single REST endpoint
│   ├── generate-frontend-component/ # React component + test
│   ├── generate-test-suite/     # Tests for existing code
│   ├── run-migrations/          # Safe migration runner
│   ├── seed-library-data/       # NEMSIS library seed
│   ├── deploy-check/            # Pre-deploy validation
│   ├── fix-bug/                 # Systematic bug diagnosis
│   ├── review-pr/               # PR code review
│   ├── sync-monday-schema/      # Import monday.com board
│   └── audit-security/          # Security vulnerability scan
│
└── rules/                       # Path-scoped coding rules
    ├── backend.md               # backend/src/**/*.ts
    ├── frontend.md              # frontend/src/**/*.{ts,tsx}
    ├── migrations.md            # backend/src/db/migrations/**
    ├── shared.md                # shared/src/**/*.ts
    └── testing.md               # **/*.test.{ts,tsx}

CLAUDE.md                        # Root instructions (loaded every session)

docs/
├── tech-stack.md                # Technology choices
├── architecture.md              # Architecture decisions
├── api-conventions.md           # REST endpoint reference
├── schema.md                    # Full PostgreSQL schema
└── nemsis-v35.md                # NEMSIS v3.5.1 element reference
```

---

## Target Architecture

```
fieldsaver/
├── backend/                     # Node.js 22 + Express 5 + TypeScript
│   ├── src/
│   │   ├── api/                 # Route handlers (thin, delegate to services)
│   │   ├── db/
│   │   │   ├── migrations/      # Knex timestamped migrations
│   │   │   ├── seeds/           # NEMSIS data + test data
│   │   │   └── queries/         # Typed Knex query helpers
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # auth, validation, error handling
│   │   └── app.ts
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── factories.ts
│
├── frontend/                    # React 18 + Vite 5 + TypeScript
│   └── src/
│       ├── components/
│       │   ├── canvas/          # GridCanvas, ResizableRow
│       │   ├── fields/          # FieldSettingsPanel, FieldPreview, LiveField
│       │   ├── library/         # UnifiedLibraryBrowser, LibRowItem
│       │   ├── preview/         # PreviewModal, PreviewProgress, RequiredDrawer
│       │   ├── settings/        # FormSettingsPage, FSSSection
│       │   ├── narrative/       # NarrativeBuilder
│       │   └── common/          # VInput, VBtn, VToggle, etc.
│       ├── stores/              # useFormStore, useLibraryStore
│       ├── hooks/               # useForm, useLibraries, useSubmit
│       ├── api/                 # Typed fetch wrappers
│       └── constants/           # design.ts (V tokens), fieldTypes.ts
│
└── shared/                      # Pure TypeScript — no Node/browser deps
    └── src/
        ├── types/               # Form, Field, Library, LibraryRow, etc.
        └── schemas/             # Zod validation schemas
```

---

## Key Constraints

These come from the original single-file artifact environment and are enforced in the frontend rules:

1. All JSX-returning functions must be top-level `function` declarations
2. No `const X = () => <JSX>` inside component bodies
3. No IIFEs in component bodies: `(() => {})(...)`
4. No `useState` inside `.map()` callbacks
5. Use `V` design tokens for all colors/spacing

---

## NEMSIS v3.5.1

The built-in NEMSIS library (~108 rows) is seeded via `/seed-library-data`. See `docs/nemsis-v35.md` for the complete element reference, export key naming conventions, and NOT Value / Pertinent Negative handling.
