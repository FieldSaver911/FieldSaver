# Tech Stack

## Backend
- **Runtime:** Node.js 22 LTS
- **Framework:** Express 5
- **Language:** TypeScript 5 (strict)
- **Database ORM:** Knex.js + `knex-stringcase` for camelCase↔snake_case
- **Database:** PostgreSQL 16
- **Auth:** JWT (jsonwebtoken) + bcrypt for passwords
- **Validation:** Zod (schemas shared with frontend)
- **Testing:** Vitest + Supertest for integration tests
- **Logging:** Pino

## Frontend
- **Framework:** React 18
- **Language:** TypeScript 5 (strict)
- **Build:** Vite 5
- **State:** Zustand (cross-component); useState (local UI)
- **Routing:** React Router v7
- **HTTP Client:** Custom typed fetch wrapper (no axios)
- **Styling:** Inline styles (mirrors original artifact design system)
- **Testing:** Vitest + React Testing Library
- **E2E:** Playwright

## Shared
- **Types:** TypeScript interfaces + Zod schemas
- **Package manager:** npm workspaces

## Infrastructure
- **Containerization:** Docker + Docker Compose (dev + prod)
- **DB migrations:** Knex migrate CLI
- **monday.com integration:** monday.com API v2 (GraphQL)
- **CI/CD:** GitHub Actions
