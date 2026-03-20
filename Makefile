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
DB_DIR       := backend/local-database

# Docker Compose file for the full local stack (DB + backend container)
DC           := docker compose -f $(DB_DIR)/docker-compose.yml

# Maven wrapper / command
MVN          := mvn

.PHONY: help \
        build build-skip-tests clean \
        test \
        db-up db-down db-logs db-reset \
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

# ─── Full local stack (DB + backend container) ───────────────────────────────
up: ## Build & start the full stack (DB + backend) in detached mode
	$(DC) up -d --build

down: ## Stop and remove all containers in the stack
	$(DC) down

logs: ## Follow logs for all containers in the stack
	$(DC) logs -f

restart: down up ## Tear down and restart the full stack

# ─── Environment setup ───────────────────────────────────────────────────────
env-setup: ## Create backend/.env from .env.example (if it does not exist yet)
	@if [ -f $(BACKEND_DIR)/.env ]; then \
		echo "  ⚠  $(BACKEND_DIR)/.env already exists – skipping."; \
	else \
		cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env; \
		echo "  ✅ Created $(BACKEND_DIR)/.env – remember to fill in real values!"; \
	fi
