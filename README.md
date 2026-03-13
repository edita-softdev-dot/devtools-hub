# DevTools Hub

A containerized landing page for internal developer tools, built with **NestJS**, **ElasticSearch**, and **Vue 3**.

Administrators can manage links through an authenticated dashboard, and developers can discover and jump to the tools they need from a searchable, categorized interface.

## Tech Stack

| Layer          | Technology                                         |
|----------------|-----------------------------------------------------|
| Backend        | NestJS 11, TypeScript, Node.js 20                   |
| Database       | ElasticSearch 8.13 (NoSQL document store)            |
| Frontend       | Vue 3 (Composition API), TypeScript, Vite            |
| Auth           | JWT (Passport.js) with bcrypt password hashing       |
| Containers     | Docker multi-stage builds, Docker Compose            |
| Orchestration  | Kubernetes (Deployment, StatefulSet, Ingress)        |
| CI/CD          | GitHub Actions (lint, test, build, push to GHCR)     |
| API Docs       | Swagger / OpenAPI at `/api/docs`                     |

## Architecture

```
┌──────────────────────┐       ┌──────────────────────┐
│                      │       │                      │
│   Vue 3 Frontend     │──────▶│   NestJS Backend     │
│   (nginx container)  │ REST  │   (Node.js container) │
│                      │       │                      │
└──────────────────────┘       └──────────┬───────────┘
                                          │
                               ┌──────────▼───────────┐
                               │                      │
                               │   ElasticSearch 8     │
                               │   (document store)    │
                               │                      │
                               └──────────────────────┘
```

### Backend Modules

- **AuthModule** — JWT login, Passport strategy, route guards, `@Public()` decorator
- **LinksModule** — Full CRUD for developer tool links with validation
- **UsersModule** — Admin user management with bcrypt
- **ElasticsearchModule** — Connection management, index lifecycle, health checks
- **HealthModule** — Liveness (`/api/health`) and readiness (`/api/health/ready`) probes

### Design Patterns

- **Repository Pattern** — Data access abstracted behind `LinksRepository` and `UsersRepository`, decoupling business logic from ElasticSearch specifics
- **Dependency Injection** — NestJS DI container manages all service dependencies
- **Guard Pattern** — `JwtAuthGuard` with `@Public()` decorator for route-level access control
- **DTO Validation** — Input validated with `class-validator` before reaching service layer
- **Global Exception Filter** — Consistent error response format across all endpoints
- **Interceptor Pattern** — Request logging with duration tracking

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Option 1: Docker Compose (Recommended)

```bash
# Start everything with a single command
docker compose up --build

# Application available at:
#   Frontend:  http://localhost:8080
#   Backend:   http://localhost:3000
#   API Docs:  http://localhost:3000/api/docs
#   ES:        http://localhost:9200
```

### Option 2: Local Development

```bash
# 1. Start ElasticSearch
docker compose up elasticsearch -d

# 2. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Start backend (port 3000)
cd backend && npm run start:dev

# 4. Start frontend (port 5173) — in another terminal
cd frontend && npm run dev
```

### Option 3: Makefile

```bash
make dev    # Start ES + backend + frontend for local development
make up     # Build and start all Docker containers
make down   # Stop containers
make help   # Show all available commands
```

## Default Credentials

On first startup, the application seeds an admin user and sample developer tool links:

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@devtools.local` |
| Password | `admin123`             |

> Change these via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

## API Documentation

Interactive Swagger documentation is available at `/api/docs` when the backend is running.

### Key Endpoints

| Method   | Path              | Auth     | Description                    |
|----------|-------------------|----------|--------------------------------|
| `GET`    | `/api/links`      | Public   | Get all active links           |
| `GET`    | `/api/links/admin`| Bearer   | Get all links (incl. inactive) |
| `POST`   | `/api/links`      | Bearer   | Create a new link              |
| `PATCH`  | `/api/links/:id`  | Bearer   | Update a link                  |
| `DELETE` | `/api/links/:id`  | Bearer   | Delete a link                  |
| `POST`   | `/api/auth/login` | Public   | Authenticate, returns JWT      |
| `GET`    | `/api/auth/profile`| Bearer  | Get current user profile       |
| `GET`    | `/api/health`     | Public   | Liveness probe                 |
| `GET`    | `/api/health/ready`| Public  | Readiness probe (checks ES)    |

### Link Entity

Links support flexible attributes stored as NoSQL documents in ElasticSearch:

```json
{
  "id": "auto-generated",
  "title": "Grafana",
  "url": "https://grafana.internal.io",
  "description": "Application monitoring dashboards",
  "icon": "activity",
  "category": "Monitoring",
  "sortOrder": 0,
  "isActive": true,
  "tags": ["production", "critical"],
  "environment": "production",
  "createdAt": "2025-03-13T10:00:00.000Z",
  "updatedAt": "2025-03-13T10:00:00.000Z",
  "createdBy": "admin-user-id"
}
```

The NoSQL nature of ElasticSearch allows adding new attributes to links without schema migrations — simply include additional fields in the request body.

## Environment Variables

| Variable             | Default                    | Description                        |
|----------------------|----------------------------|------------------------------------|
| `PORT`               | `3000`                     | Backend server port                |
| `ELASTICSEARCH_NODE` | `http://localhost:9200`    | ElasticSearch connection URL       |
| `JWT_SECRET`         | `change-me-in-production`  | Secret for JWT token signing       |
| `JWT_EXPIRES_IN`     | `24h`                      | JWT token expiration               |
| `ADMIN_EMAIL`        | `admin@devtools.local`     | Initial admin email                |
| `ADMIN_PASSWORD`     | `admin123`                 | Initial admin password             |
| `CORS_ORIGIN`        | `http://localhost:5173`    | Allowed CORS origin                |

## Kubernetes Deployment

Manifests are in `k8s/`. Deploy in order:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml        # Edit secrets first!
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/elasticsearch.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

The deployment includes:
- **ElasticSearch StatefulSet** with persistent volume claims
- **Backend Deployment** (2 replicas) with readiness/liveness probes
- **Frontend Deployment** (2 replicas) with nginx
- **Ingress** routing `/api` to backend and `/` to frontend
- **ConfigMap** and **Secret** for environment configuration

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR:

1. **Lint & Typecheck** — Parallel checks for backend and frontend
2. **Test** — Backend tests against a real ElasticSearch service container
3. **Build & Push** — Multi-stage Docker builds pushed to GitHub Container Registry (on `main` only)

## Project Structure

```
devtools-hub/
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── auth/             # Authentication (JWT, Passport, guards)
│   │   ├── links/            # Link CRUD (controller, service, repository)
│   │   ├── users/            # User management
│   │   ├── elasticsearch/    # ES connection and index management
│   │   ├── health/           # Health check endpoints
│   │   ├── common/           # Exception filters, interceptors
│   │   ├── config/           # Environment configuration
│   │   ├── app.module.ts     # Root module
│   │   └── main.ts           # Bootstrap with Swagger, CORS, Helmet
│   ├── test/                 # E2E tests
│   └── Dockerfile            # Multi-stage production build
├── frontend/                 # Vue 3 SPA
│   ├── src/
│   │   ├── views/            # LandingPage, LoginPage, AdminPanel
│   │   ├── components/       # LinkCard, LinkForm, DynamicIcon
│   │   ├── composables/      # useAuth, useLinks, useApi
│   │   ├── router/           # Vue Router with auth guards
│   │   └── types/            # TypeScript interfaces
│   ├── nginx.conf            # Production nginx with API proxy
│   └── Dockerfile            # Multi-stage: build + nginx
├── k8s/                      # Kubernetes manifests
├── .github/workflows/        # CI pipeline
├── docker-compose.yml        # Local development orchestration
├── Makefile                  # Developer convenience commands
└── .env.example              # Environment template
```

## Security Measures

- **Password hashing** with bcrypt (12 salt rounds)
- **JWT authentication** with configurable expiration
- **Rate limiting** (30 requests/minute globally)
- **Helmet** HTTP security headers
- **CORS** with configurable origin
- **Input validation** with whitelist mode (unknown fields rejected)
- **Non-root containers** — backend runs as unprivileged user
- **No open registration** — admin created via seed only

## License

MIT
