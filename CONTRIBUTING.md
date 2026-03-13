# Contributing to DevTools Hub

## Prerequisites

- **Node.js** 20+
- **Docker** and **Docker Compose**
- A code editor with TypeScript support

## Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/edita-softdev-dot/devtools-hub.git
cd devtools-hub

# 2. Copy environment variables
cp .env.example .env

# 3. Start ElasticSearch
docker compose up elasticsearch -d

# 4. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 5. Start backend (terminal 1)
cd backend && npm run start:dev

# 6. Start frontend (terminal 2)
cd frontend && npm run dev
```

Or use Docker Compose for the full stack:

```bash
docker compose up --build
```

## Code Style

- **TypeScript** is required for all source files
- **Prettier** handles formatting — run `npm run format` before committing
- **ESLint** enforces code quality — run `npm run lint` to check

Both backend and frontend follow these conventions:
- Classes and interfaces use `PascalCase`
- Functions, variables, and file names use `camelCase`
- DTOs validate input with `class-validator` decorators
- Services contain business logic; repositories handle data access

## Testing

Run tests before submitting changes:

```bash
# Backend unit tests
cd backend && npm test

# Backend E2E tests
cd backend && npm run test:e2e

# All tests with coverage
cd backend && npm run test:cov
```

**Expectations:**
- New features should include unit tests for the service layer
- Bug fixes should include a regression test
- E2E tests cover critical API paths (health, auth, CRUD)

## Project Architecture

```
backend/src/
├── auth/           # JWT authentication (guards, strategies, DTOs)
├── links/          # Link CRUD (controller → service → repository)
├── users/          # User management
├── elasticsearch/  # ES connection and index lifecycle
├── health/         # Liveness and readiness probes
├── common/         # Exception filters, interceptors
└── config/         # Environment configuration

frontend/src/
├── views/          # Page-level components (Landing, Login, Admin)
├── components/     # Reusable components (LinkCard, LinkForm)
├── composables/    # Reactive logic (useAuth, useLinks, useApi)
├── router/         # Route definitions with auth guards
└── types/          # TypeScript interfaces
```

**Key patterns:**
- **Repository Pattern** — data access is abstracted behind repository classes, decoupled from ElasticSearch specifics
- **Dependency Injection** — NestJS DI container manages all service wiring
- **Guard + Decorator** — `JwtAuthGuard` secures routes by default; `@Public()` opts out
- **Composables** — Vue 3 Composition API for reusable reactive logic

## Branch & Commit Conventions

- Branch from `main` for new work
- Use descriptive branch names: `feat/add-link-sorting`, `fix/auth-token-expiry`
- Write clear commit messages: `feat: add category filtering to landing page`
- Keep commits focused — one logical change per commit

## Submitting Changes

1. Ensure all tests pass (`npm test` and `npm run test:e2e`)
2. Run the linter (`npm run lint`)
3. Verify the Docker build works (`docker compose up --build`)
4. Open a pull request with a clear description of the change
