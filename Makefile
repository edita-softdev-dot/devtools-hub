.PHONY: help dev dev-backend dev-frontend up down build logs clean test lint

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development
dev: ## Start all services for local development
	@echo "Starting ElasticSearch..."
	docker compose up elasticsearch -d
	@echo "Waiting for ElasticSearch to be ready..."
	@until curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; do sleep 2; done
	@echo "ElasticSearch ready. Starting backend and frontend..."
	$(MAKE) dev-backend &
	$(MAKE) dev-frontend &
	wait

dev-backend: ## Start backend in development mode
	cd backend && npm run start:dev

dev-frontend: ## Start frontend in development mode
	cd frontend && npm run dev

# Docker
up: ## Start all containers with docker compose
	docker compose up --build -d

down: ## Stop all containers
	docker compose down

build: ## Build all containers
	docker compose build

logs: ## Tail container logs
	docker compose logs -f

# Quality
test: ## Run backend tests
	cd backend && npm test

lint: ## Run linting
	cd backend && npm run lint
	cd frontend && npm run lint

# Cleanup
clean: ## Remove containers, volumes, and build artifacts
	docker compose down -v
	rm -rf backend/dist frontend/dist
