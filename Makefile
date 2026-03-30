# ─────────────────────────────────────────────────────────────────────────────
# ZurImpact – Project Makefile
# Run `make help` to see all available targets.
#
#To start for the first time:
# make env-setup
# make db-up
# make up
# ─────────────────────────────────────────────────────────────────────────────

# Project directories
BACKEND_DIR  := backend
FRONTEND_DIR := frontend
ENV_DIR      := local-env

# Docker Compose file for the full local stack (DB + backend container)
DC           := docker compose -f $(ENV_DIR)/docker-compose.yaml

# Maven wrapper / command
MVN          := mvn

.PHONY: help \
        build build-skip-tests clean \
        test \
        db-up db-down db-logs db-reset \
		backend-up backend-down backend-logs backend-reset \
        up down logs restart \
        env-setup

# ─── Default target ──────────────────────────────────────────────────────────
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo ""
	@echo "  ZurImpact – available make targets"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Maven / Build ───────────────────────────────────────────────────────────
build: ## Compile & package the backend WAR (runs tests)
	$(MVN) clean package -f $(BACKEND_DIR)/pom.xml

build-skip-tests: ## Compile & package the backend WAR (skip tests)
	$(MVN) clean package -DskipTests -f $(BACKEND_DIR)/pom.xml

clean: ## Remove backend build artifacts (target/ directory)
	$(MVN) clean -f $(BACKEND_DIR)/pom.xml

test: ## Run backend tests
	$(MVN) test -f $(BACKEND_DIR)/pom.xml

# ─── Local Database only (no backend container) ──────────────────────────────
db-up: ## Start only the PostgreSQL container
	$(DC) up -d postgres-db

db-down: ## Stop and remove the PostgreSQL container
	$(DC) down postgres-db

db-logs: ## Follow PostgreSQL container logs
	$(DC) logs -f postgres-db

db-reset: ## ⚠ Destroy & recreate the PostgreSQL container (data loss!)
	$(DC) down -v postgres-db
	$(DC) up -d postgres-db

# ─── Database + Backend ───────────────────────────────────────────────────
backend-up: ## Build & start DB + Backend (No Frontend)
	$(DC) up -d --build backend

backend-down: ## Stop and remove Backend & PostgreSQL container
	$(DC) down backend postgres-db

backend-logs: ## Follow backend container logs
	$(DC) logs -f backend

backend-reset: ## ⚠ Destroy & recreate the PostgreSQL and backend container (data loss!)
	$(DC) down -v backend postgres-db
	$(DC) up -d backend postgres-db
# ─── Full local stack (DB + backend container + frontend container) ───────────────────────────────
up: ## Build & start the FULL stack (DB + Backend + Frontend)
	$(DC) up -d --build

down: ## Stop and remove ALL containers in the stack
	$(DC) down

logs: ## Follow logs for all containers in the stack
	$(DC) logs -f

restart: down up ## Tear down and restart the full stack

# ─── Environment setup ───────────────────────────────────────────────────────
env-setup: ## Create local-env/.env from .env.example
	@if [ -f $(ENV_FILE) ]; then \
		echo "  ⚠  $(ENV_FILE) already exists – skipping."; \
	else \
		cp $(ENV_DIR)/.env.example $(ENV_FILE); \
		echo "  ✅ Created $(ENV_FILE) – remember to fill in real values!"; \
	fi
