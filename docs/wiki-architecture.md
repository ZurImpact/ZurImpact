# Architecture

ZürImpact is a web-based platform that rewards sustainable actions in Zürich with credits redeemable at local partners. Users (tourists and residents) earn credits through eco-friendly behaviors and exchange them for experiences and services.

---

## System Context

### Business Context

```mermaid
graph LR
    Tourist([Tourist])
    Resident([Resident])
    Partner([Business Partner])
    Admin([City Admin])

    subgraph ZürImpact
        SYS[ZürImpact Platform]
    end

    Tourist -->|Complete actions, redeem offers| SYS
    Resident -->|Complete actions, redeem offers| SYS
    Partner -->|Validate redemptions, manage offers| SYS
    Admin -->|Define actions, configure policies| SYS

    SYS -->|Credits earned, redemption codes| Tourist
    SYS -->|Credits earned, redemption codes| Resident
    SYS -->|Customer insights, reports| Partner
    SYS -->|Impact analytics, user data| Admin
```

### Technical Context

```mermaid
graph TB
    subgraph Client["Client Browser"]
        FE[React Frontend]
        Leaflet[Leaflet Maps Library]
    end

    subgraph ZHAW["ZHAW Infrastructure"]
        K8S[Kubernetes Cluster]
        subgraph K8S_Apps["Deployed on K8S"]
            BE["Java Backend API\n(incl. AuthCookieFilter)"]
            DB[(PostgreSQL 16)]
        end
    end

    FE -->|HTTPS/JSON| BE
    FE -->|Renders maps| Leaflet
    BE -->|TCP/SQL| DB

    K8S -.->|Manages| BE
    K8S -.->|Manages| DB
```

**Data formats:** JSON over HTTPS (client–server) · SQL (database) · environment variables (configuration)

---

## Top-Level Decomposition

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        UI[React SPA]
        subgraph UI_Modules["UI Modules"]
            AUTH_UI[Auth Module]
            ACTIONS_UI[Actions Module]
            VOUCHERS_UI[Vouchers Module]
            ADMIN_UI[Admin Module]
        end
    end

    subgraph Backend["Backend Layer (Java/Spring MVC)"]
        API[REST API]
        subgraph Services["Service Layer"]
            USER_SVC[User Service]
            ACTION_SVC[Action Service]
            SUBTASK_SVC[SubTask Service]
            VOUCHER_SVC[Voucher Service]
            HISTORY_SVC[UserActionHistory Service]
        end
        subgraph Domain["Domain Layer"]
            USER_DOM[User Domain]
            ACTION_DOM[Action Domain]
            VOUCHER_DOM[Voucher Domain]
        end
    end

    subgraph Data["Data Layer"]
        DB[(PostgreSQL 16)]
    end

    UI --> API
    API --> Services
    Services --> Domain
    Domain --> DB
```

### Module Responsibilities

| Module                        | Responsibility                            | Key Components                                        |
| ----------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| **User Service**              | Authentication, profile management        | User entity, LoginController, AuthCookieFilter        |
| **Action Service**            | Action definition, filtering, completion  | Action entity, ActionController, GPS/QR validation    |
| **SubTask Service**           | Sub-task tracking within actions          | SubTask entity, SubTaskController, SubTaskValidator   |
| **Voucher Service**           | Voucher and partner offer management      | Voucher entity, VoucherController, VoucherCode entity |
| **UserActionHistory Service** | User progress and action history tracking | UserActionHistory entity, UserActionHistoryController |

---

## Architecture Decision Records

### ADR-001 — Monolithic Architecture

- **Decision:** Start with a modular monolith, not microservices
- **Rationale:** Simpler for a 9-person student team; faster development and debugging; single deployment reduces DevOps complexity; clear module boundaries allow future extraction
- **Consequences:** All services share the same deployment lifecycle; requires disciplined module boundaries; easier initial development, harder to scale horizontally

### ADR-002 — PostgreSQL as Primary Database

- **Decision:** Use PostgreSQL for all persistent data
- **Rationale:** Team familiarity; ACID guarantees critical for credit transactions; supports geospatial queries (PostGIS) for GPS features
- **Consequences:** Requires careful indexing strategy; single point of failure without replication (acceptable for MVP)

### ADR-003 — Separated Frontend Deployment

- **Decision:** React SPA hosted separately from the backend (static hosting)
- **Rationale:** Simplifies backend to a pure API; enables independent scaling of frontend and backend
- **Consequences:** Requires CORS configuration; two deployment pipelines; better separation of concerns

---

## Quality Goals

| Quality Goal        | Strategy                      | Implementation                                                                                     |
| ------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| **Security**        | Defense in depth              | Cookie-based session auth, HTTPS only, input validation, SQL injection prevention, OWASP guidelines |
| **Performance**     | Caching and optimization      | DB query optimization, lazy loading in UI, CDN for assets                                          |
| **Usability**       | User-centered design          | Mobile-first responsive design, intuitive navigation                                               |
| **Reliability**     | Error handling and monitoring | Graceful degradation, health checks, structured logging                                            |
| **Maintainability** | Clean code practices          | Modular architecture, code reviews, automated testing, arc42 documentation                         |

---

## Constraints

| Constraint                | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| **Web-Only Platform**     | No native apps; responsive web design, camera/GPS via browser |
| **Swiss Data Privacy**    | GDPR compliance, Swiss data residency preferred               |
| **Multi-Language**        | German and English minimum (i18next from day one)             |
| **Browser Compatibility** | Chrome, Safari, Firefox, Edge                                 |
| **ZHAW Infrastructure**   | Must deploy on ZHAW Kubernetes cluster via Rancher/ArgoCD     |
