# Architecture Decisions

## Monorepo with npm workspaces
All three packages (backend, frontend, shared) live in one repo. `shared/` contains TypeScript types and Zod schemas used by both. This eliminates type drift between the API layer and the UI.

## REST over GraphQL
The API is REST (not GraphQL) for simplicity. All endpoints follow the conventions in `api-conventions.md`. The monday.com integration uses their GraphQL API but is isolated to `backend/src/services/monday-service.ts`.

## Zustand over Redux
The frontend uses Zustand for global state (form tree, libraries, active selections). It is lighter than Redux and works well with React's concurrent model. Two main stores:
- `useFormStore` — the entire form object + mutation helpers
- `useLibraryStore` — all libraries, current browser state

## Knex over TypeORM/Prisma
Knex gives direct SQL control without magic. Combined with `knex-stringcase`, it auto-converts between JS camelCase and DB snake_case. Migrations are plain TypeScript files.

## Inline styles + Monday.com Vibe Design System (no CSS framework)
The frontend uses **Monday.com's Vibe Design System** (https://developer.monday.com/apps/docs/vibe-design-system) with 100% inline styles and design tokens. The original artifact's design token system (`const V = {...}`) is aligned with Vibe's color palette and spacing scale.

**Why:**
- Preserves pixel-perfect consistency with monday.com UI
- No CSS build step needed (tokens are JS constants)
- Access to 50+ pre-built Vibe components for consistent UI patterns
- No Tailwind, no CSS modules, no styled-components

## JWT Auth (no sessions)
Stateless JWT tokens. Backend validates on every request via middleware. Tokens expire in 8h; refresh tokens stored in httpOnly cookies expire in 30 days.

## Form data model is stored as JSON in PostgreSQL
The entire form tree (pages → sections → rows → cells → fields) is stored in a `jsonb` column on the `forms` table. Individual fields are NOT normalized into separate rows — this would be over-engineering for this domain. The library row assignments on each field reference library rows by ID, which ARE stored in relational tables for querying.

## Libraries are relational, not embedded in the form
While each form has a `libraries` array in its JSON, the canonical library data lives in `libraries` and `library_rows` relational tables. The form's `libraries` array contains a copy for rendering, but `library_rows` is the source of truth for Browse/Manage operations.
