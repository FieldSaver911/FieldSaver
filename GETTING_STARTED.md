# Getting Started with FieldSaver + Claude Code

## 1 — Prerequisites

```bash
# Required
node --version   # 22+
npm --version    # 10+
docker --version # 24+

# Install Claude Code
curl -fsSL https://claude.ai/install.sh | bash
```

## 2 — Clone and configure

```bash
git clone <your-repo-url> fieldsaver
cd fieldsaver

# Copy this Claude Code setup into the repo
cp -r fieldsaver-claude-code/.claude .
cp fieldsaver-claude-code/CLAUDE.md .
cp -r fieldsaver-claude-code/docs .
cp fieldsaver-claude-code/package.json .
cp fieldsaver-claude-code/tsconfig.json .
cp fieldsaver-claude-code/.eslintrc.cjs .
cp fieldsaver-claude-code/.gitignore .
cp fieldsaver-claude-code/docker-compose.yml .
cp fieldsaver-claude-code/docker-compose.prod.yml .
cp fieldsaver-claude-code/playwright.config.ts .
cp -r fieldsaver-claude-code/backend .
cp -r fieldsaver-claude-code/frontend .
cp -r fieldsaver-claude-code/shared .
cp -r fieldsaver-claude-code/e2e .
cp fieldsaver-claude-code/.env.example .env.example
cp fieldsaver-claude-code/.env.example .env
# Edit .env and fill in your secrets
```

## 3 — Start the database

```bash
docker-compose up postgres -d
# Wait for it to be healthy
docker-compose ps
```

## 4 — Open Claude Code

```bash
claude
```

Claude Code reads CLAUDE.md automatically. First message:

> *"Run the database migrations and seed the NEMSIS library data, then confirm everything is working"*

## 5 — Build the app layer by layer

### Session 1 — Project skeleton
```
Use the devops-engineer agent to create the npm workspaces, install all
dependencies, and confirm the TypeScript compiles with zero errors.
```

### Session 2 — Authentication
```
/scaffold-feature authentication "JWT login, registration, token refresh,
logout. User has email, password, name, role (admin/editor/viewer)."
```

### Session 3 — Forms CRUD
```
/scaffold-feature forms "Full CRUD for forms. A form has name, description,
data (the full page/section/field tree as JSONB), settings, and status
(draft/published/archived). Only the owner can edit their forms."
```

### Session 4 — Libraries
```
/scaffold-feature libraries "CRUD for data libraries and library rows.
Libraries have name, icon, description, source (builtin/custom/monday_board).
Rows have label, code, exportKey, category, subCategory. Role-gated:
admin=full, editor=add/edit, viewer=read-only."
```

### Session 5 — Form builder UI
```
Use the frontend-engineer agent to build the main FormBuilder page.
It should match the spec in docs/spec.md — sidebar navigation, 12-column
grid canvas, right settings panel, and top bar with Preview/Export/Settings.
```

### Session 6 — Library browser UI
```
Use the frontend-engineer agent to build UnifiedLibraryBrowser matching
the spec. Two modes: browse (checkbox select rows) and manage (full CRUD).
All the JSX rules from frontend.md must be followed.
```

### Session 7 — Preview system
```
Use the frontend-engineer agent to build PreviewModal with three layouts
(progress, single-page, side-nav) and three device viewports
(desktop, tablet 768×1024, mobile 390×844).
```

### Session 8 — Submissions
```
/scaffold-feature submissions "Submit a form and store field values, computed
exportData (keyed by exportKey), and NOT value selections. exportData must be
NEMSIS-compliant: NOT Values stored as _notValue suffix, nillable fields
submitted as xsi:nil when blank."
```

### Session 9 — monday.com integration
```
Use the integration-engineer agent to implement:
1. OAuth2 flow for connecting a monday.com account
2. GET /monday/boards — list boards
3. POST /monday/sync/:formId — create an item from a submission
4. Webhook handler with signature verification
```

### Session 10 — Tests and deploy check
```
/generate-test-suite backend/src/services/form-service.ts
/generate-test-suite backend/src/services/library-service.ts
/deploy-check
```

---

## Daily workflow

```bash
# Start the stack
docker-compose up -d

# Open Claude Code
claude

# Common skill shortcuts
/scaffold-feature <name> <description>   # New full-stack feature
/generate-api-endpoint POST /path desc   # Single endpoint
/generate-test-suite path/to/file.ts     # Tests for existing code
/fix-bug <description>                   # Diagnose and fix a bug
/review-pr 42                            # Review a PR
/deploy-check                            # Pre-deploy validation
/audit-security                          # Security scan
/run-migrations                          # Run pending migrations
/seed-library-data                       # Re-seed NEMSIS library

# Target a specific agent
Use the backend-architect agent to add rate limiting to auth endpoints
Use the frontend-engineer agent to fix the column resize bug
Use the database-engineer agent to add an index on submissions.form_id
```

---

## Key files to know

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Root instructions — read by Claude every session |
| `.claude/agents/` | 7 specialist subagents |
| `.claude/skills/` | 11 invokable `/slash-command` workflows |
| `.claude/rules/` | Path-scoped rules (auto-load when editing matching files) |
| `docs/schema.md` | Full PostgreSQL schema reference |
| `docs/nemsis-v35.md` | NEMSIS v3.5 element reference |
| `docs/api-conventions.md` | REST endpoint reference |
| `shared/src/types/index.ts` | All TypeScript domain types |
| `shared/src/schemas/index.ts` | All Zod validation schemas |
| `frontend/src/constants/design.ts` | V design tokens |
| `backend/src/db/seeds/01_nemsis_library.ts` | ~108 NEMSIS rows |
