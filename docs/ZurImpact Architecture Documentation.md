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

[![](https://mermaid.ink/img/pako:eNplUtuO2jAQ_RXLT7sSZAm5QR4qES7aC7R0g1Rpk6oyyQARiR3ZzrYU-PdOyC6F3XmxPXPOmRnP7GkiUqA-XUtWbsgiiDlBU9WycQzzDLiOYtpcSCDFbwUypj8bYG2TcfQMLNFkIgXXwNOL2BTYKgcdvZ1kxkpFptlSMrl7gyEh5h_SvtwPfmDS-iAPfCWZ0rJKdCXhKvNTL4yeqiVIDhoUFlspDfICcBZE5K9BWSoUHUGZix2kRPDafSVYWzBG0CN7ZSRgyRarI4P5Qxzzm4wnuUEGld4MhdhmMMlyzHb7SWAURDdzofRaQvh9Skz39gJw6vZD25Mxabe_HO4Xi3l49xh--3rAIq5Cz4gGqUiB33d4_9QGETSIxXB-h9kOmP1dFpsjbQNjM8bZGtR_1c-RmkVbuAVZSv0VyxW0aAGyYPWb7mtaTPUGChyAj9eUyW1MY35EUsn4ixAF9XFGSJOiWm_OIlWZMg2jjOEcirOXVVqEO56cOaf-hqLimvrdbvckSv09_UN90_QMu-N6lmlZna7ds60W3SHKMlzL7dn9XqfveJbjOMcW_XuqwzTMjmv1Lbdv9zzP7dpOi0KaaSFnzbKfdv74D4v_5zk?type=png)](https://mermaid.live/edit#pako:eNplUtuO2jAQ_RXLT7sSZAm5QR4qES7aC7R0g1Rpk6oyyQARiR3ZzrYU-PdOyC6F3XmxPXPOmRnP7GkiUqA-XUtWbsgiiDlBU9WycQzzDLiOYtpcSCDFbwUypj8bYG2TcfQMLNFkIgXXwNOL2BTYKgcdvZ1kxkpFptlSMrl7gyEh5h_SvtwPfmDS-iAPfCWZ0rJKdCXhKvNTL4yeqiVIDhoUFlspDfICcBZE5K9BWSoUHUGZix2kRPDafSVYWzBG0CN7ZSRgyRarI4P5Qxzzm4wnuUEGld4MhdhmMMlyzHb7SWAURDdzofRaQvh9Skz39gJw6vZD25Mxabe_HO4Xi3l49xh--3rAIq5Cz4gGqUiB33d4_9QGETSIxXB-h9kOmP1dFpsjbQNjM8bZGtR_1c-RmkVbuAVZSv0VyxW0aAGyYPWb7mtaTPUGChyAj9eUyW1MY35EUsn4ixAF9XFGSJOiWm_OIlWZMg2jjOEcirOXVVqEO56cOaf-hqLimvrdbvckSv09_UN90_QMu-N6lmlZna7ds60W3SHKMlzL7dn9XqfveJbjOMcW_XuqwzTMjmv1Lbdv9zzP7dpOi0KaaSFnzbKfdv74D4v_5zk)

**External Interfaces:**

| System                      | Interface Type          | Protocol        | Purpose                                 |
| --------------------------- | ----------------------- | --------------- | --------------------------------------- |
| **ZHAW Kubernetes Cluster** | Container orchestration | kubectl/Rancher | Hosting, scaling, deployment management |
| **Custom Session Auth**     | Cookie/HTTP filter      | HTTPS           | User authentication, session management |
| **Leaflet / React-Leaflet** | JavaScript library      | —               | Geolocation display, map rendering      |
| **PostgreSQL**              | Database driver         | TCP/SSL         | Persistent data storage                 |

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
- **Java 21** - Team familiarity
- **PostgreSQL 16** - Team familiarity

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

[![](https://mermaid.ink/img/pako:eNp9lFGPojAQgP8K6dNuonuCgsLDJShe5G5dPQsmd7IxXegpcWlNKZv1jP_9SovkXHH74nT4Os58KRxBTBMMHLBhaL_VgmFENLHy4kUlvjFKOCbJKgLnUHtEB8wi8KzQcoX-aoFRzDU4d_9L11VCfz2lSfGKc1En9LVqc1GjXG4YTNaimFvwbQV9JEaBP3uCEop5SknezC1n4WgyXkhwSYt4i9kN0vWm_pOsl2QpuWbExGojgw96hijeKTtVpORod9_RG_oC9ywlG226HN1fjOrOha8xDMqgSRfE7C2NpawqbHAuvcPxYg2Xo1WYiz-t2EZjklLGbnAwHAYu_CFBWLwEKN_dICu3kqzc3iAnPgxmi191i6qBSZpzyg4NZ2rXFzo8mqGUCBkq-MyFN5sqFwptVlFClYpG7DxfyZ3nuwI_vRYe4qjsV_w0dOsNV3dzmvMNw_Dno6Zb989XpcRL0m5_LS-I2otAJs5XQ2XPO_lItageVKZkegha4u1OE-D8Qa85boEMM_FU7MGxpCPAtzjDEXBEmCC2i0BETuLQHpHflGbA4awQxxgtNtu6SLFPEMdeisTEWZ1FBafwQOL6jBgJsxEtCAeObcqawDmCd-DoHfOhZw463U6337MM0xi0wAE4bb1vP5j9jtEzbdMy9a5unVrgr-xDf-j2bN20erbRsWxjYIiCOEnFZZqqj5j8lp3-AeH5bRk?type=png)](https://mermaid.live/edit#pako:eNp9lFGPojAQgP8K6dNuonuCgsLDJShe5G5dPQsmd7IxXegpcWlNKZv1jP_9SovkXHH74nT4Os58KRxBTBMMHLBhaL_VgmFENLHy4kUlvjFKOCbJKgLnUHtEB8wi8KzQcoX-aoFRzDU4d_9L11VCfz2lSfGKc1En9LVqc1GjXG4YTNaimFvwbQV9JEaBP3uCEop5SknezC1n4WgyXkhwSYt4i9kN0vWm_pOsl2QpuWbExGojgw96hijeKTtVpORod9_RG_oC9ywlG226HN1fjOrOha8xDMqgSRfE7C2NpawqbHAuvcPxYg2Xo1WYiz-t2EZjklLGbnAwHAYu_CFBWLwEKN_dICu3kqzc3iAnPgxmi191i6qBSZpzyg4NZ2rXFzo8mqGUCBkq-MyFN5sqFwptVlFClYpG7DxfyZ3nuwI_vRYe4qjsV_w0dOsNV3dzmvMNw_Dno6Zb989XpcRL0m5_LS-I2otAJs5XQ2XPO_lItageVKZkegha4u1OE-D8Qa85boEMM_FU7MGxpCPAtzjDEXBEmCC2i0BETuLQHpHflGbA4awQxxgtNtu6SLFPEMdeisTEWZ1FBafwQOL6jBgJsxEtCAeObcqawDmCd-DoHfOhZw463U6337MM0xi0wAE4bb1vP5j9jtEzbdMy9a5unVrgr-xDf-j2bN20erbRsWxjYIiCOEnFZZqqj5j8lp3-AeH5bRk)

**Module Responsibilities:**

| Module                         | Responsibility                               | Key Components                                           |
| ------------------------------ | -------------------------------------------- | -------------------------------------------------------- |
| **User Service**               | Authentication, profile management           | User entity, LoginController, AuthCookieFilter           |
| **Action Service**             | Action definition, filtering, completion     | Action entity, ActionController, GPS/QR validation       |
| **SubTask Service**            | Sub-task tracking within actions             | SubTask entity, SubTaskController, SubTaskValidator      |
| **Voucher Service**            | Voucher and partner offer management         | Voucher entity, VoucherController, VoucherCode entity    |
| **UserActionHistory Service**  | User progress and action history tracking    | UserActionHistory entity, UserActionHistoryController    |

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
| **Security**        | Defense in depth              | Cookie-based session auth, HTTPS only, input validation, SQL injection prevention, OWASP guidelines |
| **Performance**     | Caching and optimization      | DB query optimization, lazy loading in UI, CDN for assets                            |
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
- **Authentication:** Custom cookie-based session management via `AuthCookieFilter`
- **Maps/Geolocation:** Leaflet / React-Leaflet (open-source, no API key required)
- **Infrastructure:** Delegated to ZHAW K8s (predetermined constraint)

**Knowledge Management:**
- Pair programming for complex features
- Comprehensive README and setup documentation
- Architecture Decision Records (ADRs) for major choices

**Communication:**
- **WhatsApp:** Chat communication channel between team members
- **MS Teams**: Main channel for weekly syncs and calls