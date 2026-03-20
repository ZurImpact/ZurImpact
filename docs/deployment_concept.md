# Deployment Concept

## Overview

The deployment pipeline follows a two-stage promotion model based on Git events.

## Environments

| Environment | Trigger | Target |
|-------------|---------|--------|
| Staging | Push to `main` | Kubernetes (staging namespace) |
| Production | Release tag (`v*.*.*`) | Kubernetes (prod namespace) |

## Flow

```
Feature Branch → PR → main
                         │
                         ├─► CI Pipeline ──► Deploy to Staging
                         │
                    Release Tag (e.g. v1.2.0)
                         │
                         └─► CI Pipeline ──► Deploy to Production
```

## Rules

- All changes reach staging automatically on merge to `main`
- Production deployments are **only** triggered by release tags — no manual prod pushes
- Both pipelines run the same build artifact; staging serves as the final gate before tagging a release
