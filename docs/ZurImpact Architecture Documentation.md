## 1. Introduction and Goals

**Business Context:** ZürImpact is a web-based platform that rewards sustainable actions in Zürich with credits redeemable at local partners. Users (tourists and residents) earn credits through eco-friendly behaviors and exchange them for experiences and services.
### 1.1 Requirements Overview
**Functional Requirements:**
- User registration/authentication (tourists & residents)
- Action tracking system (QR codes, GPS verification)
- Credit earning and balance management
- Partner offers browsing and redemption
- Admin panel for managing actions, partners, users
- Multi-language support (DE/EN minimum)

**Quality Requirements:**
- Security: HTTPS, encrypted data, GDPR compliant
- Performance: <2s page load, handle 1K concurrent users
- Usability: Works on mobile browsers, intuitive UX
- Reliability: 99% uptime during tourist season

**Technical Constraints:**
- Web-first (responsive design for mobile)
- Swiss data residency preferred
- 3-month development timeline
### 1.2 Stakeholders

| Role                              | Expectations                                               | Concerns                               |
| --------------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| **End Users (Tourists)**          | Easy-to-use, valuable rewards, multilingual                | Privacy, mobile usability              |
| **End Users (Residents)**         | Convenient sustainable habits, local benefits              | Long-term value, ease of use           |
| **Business Partners**             | Simple redemption process, customer insights               | Integration effort, revenue impact     |
| **City of Zürich**                | Environmental impact data, tourism management              | Data accuracy, scalability             |
| **Development Team (9 students)** | Clear architecture, learning opportunity, manageable scope | Time constraints, technical complexity |
| **University (ZHAW)**             | Demonstration of software engineering skills               | Documentation, project management      |

---
## 2. Constraints

### 2.1 Technical Constraints

| Constraint                | Description                                                   | Impact                                                     |
| ------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| **Web-Only Platform**     | No native mobile apps; responsive web design required         | Limits offline capabilities, requires camera/GPS web APIs  |
| **Swiss Data Privacy**    | GDPR compliance, Swiss data residency preferred               | Hosting choices, data handling procedures                  |
| **Multi-Language**        | Support German and English minimum (French/Italian desirable) | i18n framework required from start                         |
| **Browser Compatibility** | Support modern browsers (Chrome, Safari, Firefox, Edge)       | Testing effort                                             |
| **ZHAW Infrastructure**   | Must deploy on ZHAW Kubernetes cluster via Rancher/ArgoCD     | Infrastructure decisions predetermined, limits flexibility |
### 2.2 Organizational Constraints

| Constraint               | Description                                     | Impact                                                        |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------------------- |
| **Team Size**            | 9 part-time student developers                  | Parallel work streams, communication overhead                 |
| **Timeline**             | 12 weeks (4 ECTS = 120h/student = 1,080h total) | Strict scope management, MVP focus                            |
| **Budget**               | None                                            | Free-tier prioritization, reliant on school provisioned infra |
| **Student Availability** | Part-time alongside studies, exam periods       | Flexible sprint planning, knowledge redundancy                |
| **Skill Level**          | Mixed experience levels                         | Mentoring needs, pair programming                             |
### 2.3 Conventions

| Convention          | Standard                                               | Tool/Method          |
| ------------------- | ------------------------------------------------------ | -------------------- |
| **Code Style**      | ESLint + Prettier configuration                        | Automated formatting |
| **Version Control** | Git Flow (feature branches, PR reviews)                | ZHAW GitHub          |
| **API Design**      | RESTful principles, OpenAPI documentation              | Swagger/OpenAPI 3.0  |
| **Testing**         | Minimum 70% code coverage for critical functionalities | Jest, Junit          |
| **Documentation**   | arc42 template, inline code comments                   | Markdown, JSDoc      |

## 3. Context Boundary

### 3.1 Business Context
[![](https://mermaid.ink/img/pako:eNqVU0uPmzAQ_iuWz9k0IQS6aLUSkMseVkWUNtLCHhwYwCq2kR9V0yT_bG_9YzUhTbJ9qFqfxuPvMfaMd7gUFeAAN5L0LcqigiO7lNmMiU8KpBpzw8ryTBhJlVbPl2Sap6BoBfycBV6NwW9qCZGavxKMkjwyinJQ6nx6JR2HeUz1FoUVo_x_6k8_XuQD60mp80uIko7oWkh2pboO8zVsUNj3HS2JpoL_XTlDNzf3-1iwvgMNKCwHqLrbyHf3KVQADH2oa1vw3iqOjPTNjHU4UiRUVF-QrB-YKLbNseDsDdj0-gZRcmR8Jh2tiC3oAh_pj4STBv5ZlFFaMJDogSvatCfLkJNuq2lp8VFybRaPrBXUtp-v7h4LXtPGSECJsE9O4U-vU7dS6IU8GQ2zhyJoyVcqJFoRTfbWo-B4gm1RjNDKzu1uUCmwboFBgQMbVkR-KXDBDxZHjBYft7zEgZYGJlgK07Q4qEmn7M70w6OsKLHzw35BesKfhDhvGznYnAjSDgjIWBiucXB7xOJgh7_hwPGmM8_3Fr47c1zXez9fTPAWB_586i8X3tKuubN0Pfcwwd-P6rPpret4juu7vkXM3YUlDG0V8nH8kMd_efgJhrEnQQ?type=png)](https://mermaid.live/edit#pako:eNqVU0uPmzAQ_iuWz9k0IQS6aLUSkMseVkWUNtLCHhwYwCq2kR9V0yT_bG_9YzUhTbJ9qFqfxuPvMfaMd7gUFeAAN5L0LcqigiO7lNmMiU8KpBpzw8ryTBhJlVbPl2Sap6BoBfycBV6NwW9qCZGavxKMkjwyinJQ6nx6JR2HeUz1FoUVo_x_6k8_XuQD60mp80uIko7oWkh2pboO8zVsUNj3HS2JpoL_XTlDNzf3-1iwvgMNKCwHqLrbyHf3KVQADH2oa1vw3iqOjPTNjHU4UiRUVF-QrB-YKLbNseDsDdj0-gZRcmR8Jh2tiC3oAh_pj4STBv5ZlFFaMJDogSvatCfLkJNuq2lp8VFybRaPrBXUtp-v7h4LXtPGSECJsE9O4U-vU7dS6IU8GQ2zhyJoyVcqJFoRTfbWo-B4gm1RjNDKzu1uUCmwboFBgQMbVkR-KXDBDxZHjBYft7zEgZYGJlgK07Q4qEmn7M70w6OsKLHzw35BesKfhDhvGznYnAjSDgjIWBiucXB7xOJgh7_hwPGmM8_3Fr47c1zXez9fTPAWB_586i8X3tKuubN0Pfcwwd-P6rPpret4juu7vkXM3YUlDG0V8nH8kMd_efgJhrEnQQ)

**Communication Channels:**

| Partner             | Input                                           | Output                                             |
| ------------------- | ----------------------------------------------- | -------------------------------------------------- |
| **Users**           | Browser (HTTPS), actions completed, redemptions | Credits earned, offers available, redemption codes |
| **Partners**        | Redemption validation, offer updates            | Customer insights, redemption reports              |
| **City Admins**     | Policy configurations, action definitions       | Impact analytics, user behavior data               |
### Competitor Analysis

| Competitor                                  | Type              | Strengths                                       | Weaknesses                                      | Differentiation                               |
| ------------------------------------------- | ----------------- | ----------------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| **CopenPay (Copenhagen)**                   | Public initiative | Established brand, city backing, proven concept | Limited to Copenhagen, seasonal program         | First in Switzerland, year-round operation    |
| **Too Good To Go**                          | Food waste app    | Large user base, established partnerships       | Single-purpose (food only), no city integration | Broader sustainability scope, city-endorsed   |
| **Coop/Migros Loyalty Programs**            | Retail loyalty    | Massive reach, existing infrastructure          | Not sustainability-focused, retail-only         | Pure sustainability mission, diverse partners |
| **myswitzerland.com / Zürich Tourism Apps** | Tourism platforms | Official tourism authority, comprehensive info  | No gamification, no sustainability rewards      | Gamified engagement, tangible rewards         |

**Market Positioning:** ZürImpact occupies a unique niche as the first city-integrated, sustainability-focused rewards platform in Switzerland, combining elements of loyalty programs (rewards), tourism apps (local experiences), and civic initiatives (environmental impact).

**Competitive Advantages:**
- First-mover in Swiss market
- Direct city partnership potential
- Combines tourism and resident engagement
- Measurable environmental impact

### 3.2 Technical Context

[![](https://mermaid.ink/img/pako:eNp1U9uO2jAQ_RXLT60ELOQCSx4qJRCyN1raIFXapKpMMhuiDXZkO9ulwL93QnYpUGo_ZDzn-Mwl4w1NRArUoZlk5ZLMvZgTXKpaNI5RkQPXUUwbg3hS_FIgY_qjIdZr4kffgCWaTKTgGnj6hqHVGGeajzfud1SsP-SWP0mmtKwSXUk4kb2_DqP7agGSgwaFmVRKgzwiHASR-dMtS4WiYygLsYaUCF67TwTr5fnRHXthxGPJM-ZH3NntGWPsRR9mQulMQvj14eMReqjnf4X5r5ggZwXm8W6SEORLnoA67ZgbTXIJC6aAuJVeHkHBNAqEyAogU1aqs_zCIAoxeCDzlPgrlheXOz3xSbv9aXszn8_Cq7vwy-ct1t1AXgPNR7MrrG6L1Z7491e2mN8lbzC95A2D49DYc9LuIDplnGWg_kb-Fxl7tEVXILGQFCdwU_NiqpewwkFw0EyZfI5pzHfIY5UW4Zon1MFhgRaVosqW1HlihcJTVaZMwzhn-CNW75SS8UchDsdM1mHeLkhsGciRqLimjr3nUmdDX6nTNky7MzQN3N2h0TW7g0GLrqnTM4zOwDb7ttWzh_1rY2jsWvT3Xr_bGVpG37AG1gAZPcs0WhTSXAs5bR7X_o3t_gBE7wIy?type=png)](https://mermaid.live/edit#pako:eNp1U9uO2jAQ_RXLT60ELOQCSx4qJRCyN1raIFXapKpMMhuiDXZkO9ulwL93QnYpUGo_ZDzn-Mwl4w1NRArUoZlk5ZLMvZgTXKpaNI5RkQPXUUwbg3hS_FIgY_qjIdZr4kffgCWaTKTgGnj6hqHVGGeajzfud1SsP-SWP0mmtKwSXUk4kb2_DqP7agGSgwaFmVRKgzwiHASR-dMtS4WiYygLsYaUCF67TwTr5fnRHXthxGPJM-ZH3NntGWPsRR9mQulMQvj14eMReqjnf4X5r5ggZwXm8W6SEORLnoA67ZgbTXIJC6aAuJVeHkHBNAqEyAogU1aqs_zCIAoxeCDzlPgrlheXOz3xSbv9aXszn8_Cq7vwy-ct1t1AXgPNR7MrrG6L1Z7491e2mN8lbzC95A2D49DYc9LuIDplnGWg_kb-Fxl7tEVXILGQFCdwU_NiqpewwkFw0EyZfI5pzHfIY5UW4Zon1MFhgRaVosqW1HlihcJTVaZMwzhn-CNW75SS8UchDsdM1mHeLkhsGciRqLimjr3nUmdDX6nTNky7MzQN3N2h0TW7g0GLrqnTM4zOwDb7ttWzh_1rY2jsWvT3Xr_bGVpG37AG1gAZPcs0WhTSXAs5bR7X_o3t_gBE7wIy)

**External Interfaces:**

| System                       | Interface Type          | Protocol        | Purpose                                 |
| ---------------------------- | ----------------------- | --------------- | --------------------------------------- |
| **ZHAW Kubernetes Cluster**  | Container orchestration | kubectl/Rancher | Hosting, scaling, deployment management |
| **Firebase Authentication**  | SDK/REST API            | HTTPS           | User authentication, session management |
| **Google Maps API**          | REST API                | HTTPS           | Geolocation, place search, mapping      |
| **PostgreSQL**               | Database driver         | TCP/SSL         | Persistent data storage                 |
| **Email Service (SendGrid)** | REST API                | HTTPS           | Transactional emails, notifications     |

**Data Formats:**

- Client-Server: JSON over HTTPS
- Database: Relational (SQL)
- Configuration: Environment variables, JSON

## 4. Solution Strategy

### 4.1 Technology Decisions

**Frontend:**
- **React 19** with TypeScript - Component-based, strong typing, team familiarity
- **Tailwind CSS** - Rapid responsive design, mobile-first
- **React Router** - Client-side routing
- **i18next** - Internationalization framework

**Backend:**
- **Java 24** - Team familiarity
- **PostgreSQL 18** - Team familiarity
- **Redis** (optional) - Session caching, rate limiting

**Infrastructure:**
- **ZHAW Kubernetes cluster** - Container orchestration and hosting
- **Rancher** - Kubernetes management interface
- **ArgoCD** - GitOps continuous deployment
- **GitHub Actions** - CI/CD pipeline for building and testing

**Development Tools:**
- **GitHub** - Version control, project management
- **Figma** - Design collaboration
- **Atlassian Jira** - Documentation, issue tracking

### 4.2 Top-Level Decomposition

[![](https://mermaid.ink/img/pako:eNqFlF1v2jAUhv9K5CsqUQYJNJCLSSFha6ZCWT52MTIhL_EgamMjx2nHEP99_goqNGy-yTnHT47zvnZ8ABnJEXDAhsLd1oinKTb4qOqfqvCJEswQzlcpaELjAe4RTcEPhYqRBKsQwYwZ0dJ9Uz51SYL1nOT1M6p4nyQwdHLWQww3ie_XvJlbs62GLgkvDh4XkYQyVhBctXNLN4wXs1CCS0gZRvQK6frzYCH75WWB3zNcsUpOwYVFU5g9KYd0pAwyOl_gC_wQ7WiBN8aUEHZzptddctNmUSwC4zNk6BXu27yLEH0pMumcDls2QG5CNAvX0TdvlVR8dc222icpZd8VzgtnfhBLzqMoL9gVTtssQW1zC3ly7kyYT0pYYC5LBf9S5T_OlSqFtosSkBbVimlNAtOaWrFGkuAaSe_A_x4KHzIopPFHizB_uuosScU2FEVfH27ezHiudz9bdUL-fZXhwWyLmtmLlfhfdHv7URwelYtTJArNcVHVJpNTSoWa0J7L8rSFld8BuqBElIM5vyAOgkoB26ISpcDhYQ7pUwpSfOQcrBmJ9jgDDqM16gJK6s0WOL_gc8WzepfzA-4XkJtTnqo7iL8TUjavbKhYR89RLhdRj9SYAcfsSxg4B_AbONao3-ubtm2ag8HItMaDLtjzqtWbWPZoMLLMiX03GU-Gxy74I9v3e2N7OOHDtm1rYN6Nh10g9p_Qubr75BV4_Av_1Xnc?type=png)](https://mermaid.live/edit#pako:eNqFlF1v2jAUhv9K5CsqUQYJNJCLSSFha6ZCWT52MTIhL_EgamMjx2nHEP99_goqNGy-yTnHT47zvnZ8ABnJEXDAhsLd1oinKTb4qOqfqvCJEswQzlcpaELjAe4RTcEPhYqRBKsQwYwZ0dJ9Uz51SYL1nOT1M6p4nyQwdHLWQww3ie_XvJlbs62GLgkvDh4XkYQyVhBctXNLN4wXs1CCS0gZRvQK6frzYCH75WWB3zNcsUpOwYVFU5g9KYd0pAwyOl_gC_wQ7WiBN8aUEHZzptddctNmUSwC4zNk6BXu27yLEH0pMumcDls2QG5CNAvX0TdvlVR8dc222icpZd8VzgtnfhBLzqMoL9gVTtssQW1zC3ly7kyYT0pYYC5LBf9S5T_OlSqFtosSkBbVimlNAtOaWrFGkuAaSe_A_x4KHzIopPFHizB_uuosScU2FEVfH27ezHiudz9bdUL-fZXhwWyLmtmLlfhfdHv7URwelYtTJArNcVHVJpNTSoWa0J7L8rSFld8BuqBElIM5vyAOgkoB26ISpcDhYQ7pUwpSfOQcrBmJ9jgDDqM16gJK6s0WOL_gc8WzepfzA-4XkJtTnqo7iL8TUjavbKhYR89RLhdRj9SYAcfsSxg4B_AbONao3-ubtm2ag8HItMaDLtjzqtWbWPZoMLLMiX03GU-Gxy74I9v3e2N7OOHDtm1rYN6Nh10g9p_Qubr75BV4_Av_1Xnc)

**Module Responsibilities:**

| Module              | Responsibility                             | Key Components                                       |
| ------------------- | ------------------------------------------ | ---------------------------------------------------- |
| **User Service**    | Authentication, profile management         | User entity, Auth controller, Profile API            |
| **Action Service**  | Action definition, completion tracking     | Action entity, Verification logic, GPS/QR validation |
| **Credit Service**  | Credit calculation, transaction management | Transaction entity, Balance calculation, Audit trail |
| **Partner Service** | Partner/offer management, redemption       | Partner entity, Offer entity, Redemption logic       |

### 4.3 Key Architectural Decision Records

**ADR-001: Monolithic Architecture**
- **Decision:** Start with modular monolith, not microservices
- **Rationale:**
    - Simpler for 9-person student team
    - Faster development and debugging
    - Single deployment reduces DevOps complexity
    - Clear module boundaries allow future extraction
- **Consequences:**
    - All services share same deployment lifecycle
    - Requires disciplined module boundaries
    - Easier initial development, harder to scale horizontally

**ADR-002: PostgreSQL as Primary Database**
- **Decision:** Use PostgreSQL for all persistent data
- **Rationale:**
    - Team familiarity
    - ACID (Atomicity, Consistency, Isolation, Durability) guarantees critical for credit transactions
    - Supports geospatial queries (PostGIS) for GPS features
- **Consequences:**
    - Need careful indexing strategy
    - Single point of failure without replication (acceptable for MVP)

**ADR-003: Serverless Frontend Deployment**
- **Decision:** React SPA hosted separately from backend (static hosting)
- **Rationale:**
    - Simplifies backend to pure API
    - Independent scaling of frontend/backend
- **Consequences:**
    - Requires CORS configuration
    - Two deployment pipelines
    - Better separation of concerns

### 4.4 Quality Goal Achievement Strategy

| Quality Goal        | Strategy                      | Implementation                                                                       |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| **Security**        | Defense in depth              | JWT tokens, HTTPS only, input validation, SQL injection prevention, OWASP guidelines |
| **Performance**     | Caching and optimization      | Redis for sessions, DB query optimization, lazy loading in UI, CDN for assets        |
| **Usability**       | User-centered design          | Mobile-first responsive design, user testing sessions, intuitive navigation          |
| **Reliability**     | Error handling and monitoring | Try-catch blocks, graceful degradation, health checks, logging and monitoring        |
| **Maintainability** | Clean code practices          | Modular architecture, code reviews, comprehensive documentation, automated testing   |

### 4.5 Organizational Decisions

**Development Process:**
- **Methodology:** Kanban Agile - Caretaker model with 2-week sprints
- **Team Organization:**
    - 3 backend developers (Java/Spring)
    - 2 frontend developers (React/TypeScript)
    - 2 full-stack developers (bridge between layers)
    - 2 DevOps/infrastructure focus (K8s deployment)
- **Code Review:** All PRs require 2 approvals before merge
- **Testing Strategy:** Unit tests (70% coverage), integration tests, E2E tests for critical paths

**Third-Party Delegation:**
- **Authentication:** Delegated to Firebase Auth (reduces security complexity)
- **Email:** Delegated to SendGrid (avoid managing mail servers)
- **Maps/Geolocation:** Delegated to Google Maps API (accurate, maintained)
- **Infrastructure:** Delegated to ZHAW K8s (predetermined constraint)

**Knowledge Management:**
- Pair programming for complex features
- Comprehensive README and setup documentation
- Architecture Decision Records (ADRs) for major choices

**Communication:**
- **WhatsApp:** Chat communication channel between team members
- **MS Teams**: Main channel for weekly syncs and calls