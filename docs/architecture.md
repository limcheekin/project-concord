# **Architecture**

### **1. Introduction**

This document outlines the complete full-stack architecture for Project Concord, a headless service designed to bridge the gap between legacy database schemas and modern AI agents. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development, ensuring consistency and adherence to chosen patterns and technologies, as specified in the Product Requirements Document (PRD).

**Change Log**

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-08-17 | 1.3 | **Code-validated edition.** Aligned document with the actual implementation. Corrected logging, security, and configuration details to reflect the current codebase. Moved unimplemented features to "Recommendations". | Winston (Architect) |
| 2025-08-17 | 1.2 | Added detailed sections on configuration, data contract governance, and specific security hardening measures. | Winston (Architect) |
| 2025-08-17 | 1.1 | Enhanced with detailed sections on caching, security, error handling, and future-proofing. | Winston (Architect) |
| 2025-08-04 | 1.0 | Initial architecture document based on project analysis and PRD. | Winston (Architect) |

---

### **2. High Level Architecture**

**Technical Summary**

Project Concord is architected as a containerized, TypeScript-based monorepo that implements the **Custom Metadata-Enriching Server Pattern**. It exposes legacy database schemas to AI agents via the Model Context Protocol (MCP), dynamically translating cryptic legacy schemas into semantically rich definitions defined in a version-controlled Data Contract. The system prioritizes production-grade implementation, comprehensive observability, and rigorous input validation to ensure safe and reliable read-only data access for AI agents.

**Platform and Infrastructure Choice**

* **Platform**: The system will be platform-agnostic, designed for deployment in any environment that supports **Docker containers**.
* **Key Services**:
    * **Compute**: A container orchestration service (e.g., AWS ECS, Azure Container Apps, or Kubernetes).
    * **Caching**: A managed **Redis** service for performance optimization.
    * **Logging**: A centralized logging platform (e.g., AWS CloudWatch, Datadog) to aggregate the server's structured logs for observability.

**High Level Architecture Diagram**

```mermaid
graph TD
    subgraph "AI Environment"
        AI_Host("AI Host / Agent")
    end

    subgraph "Project Concord (Docker)"
        subgraph "Monorepo"
            MCP_Server("mcp-server (app)")
            Data_Contract_Package("data-contract (package)")
        end
        subgraph "Services & Logic"
            Config_Service("Configuration Service")
            Auth_Factory("Authentication Factory")
            Data_Contract("Data Contract Service")
            DB_Connector("Database Connector")
            Tool_Logic("MCP Tool Logic")
        end
        MCP_Server -- "Uses" --> Auth_Factory
        MCP_Server -- "Uses" --> Tool_Logic
        Tool_Logic -- "Uses" --> Data_Contract
        Tool_Logic -- "Uses" --> DB_Connector
        Data_Contract -- "Reads" --> Data_Contract_Package
        MCP_Server -- "Uses" --> Config_Service
    end

    subgraph "Legacy Systems"
        Legacy_DB("Legacy Database")
    end

    AI_Host -- "MCP (JSON-RPC over HTTP)" --> MCP_Server
    DB_Connector -- "SQL (Read-Only)" --> Legacy_DB
````

**Architectural Patterns**

  * **Custom Metadata-Enriching Server**: We are building the mediation logic ourselves for maximum control, rather than using a pre-built federated engine.
  * **Adapter Pattern**: The server acts as an adapter, converting the legacy database's implicit, cryptic schema into the explicit, standardized MCP interface.
  * **Facade Pattern**: The server provides a single, simplified interface (the MCP tools) for the complex operations of auditing, mapping, and safely querying the legacy database.

---

### **3. Tech Stack**

This section provides the definitive list of technologies, libraries, and tools that will be used to build and operate Project Concord.

| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Language**| TypeScript | \~5.5.3 | Primary development language | Production-grade, strong typing. |
| **Runtime**| Node.js | \>=18 | JavaScript runtime | LTS version, stable performance. |
| **Monorepo Manager**| Turborepo | \~2.0 | Build system and monorepo manager | High-performance build caching to accelerate development and CI/CD. |
| **Web Framework**| Hono | ^4.5.1 | Web framework for HTTP transport | Lightweight, fast, and suitable for building the API layer. |
| **MCP SDK** | @modelcontextprotocol/sdk | \~1.1 | MCP server implementation | Official SDK for adhering to the MCP specification. |
| **Configuration** | `dotenv` | ^16.4.5 | Environment variable loading | Manages environment-specific settings from a `.env` file for local development. |
| **Production Database**| (Not Specified) | - | The legacy database system | This will be connected to, but not managed by, Project Concord. |
| **Test Database**| PostgreSQL | 17.x | Relational database for testing | Provides a production-parity environment, ensuring high-fidelity testing. |
| **Testing**| Vitest | ^1.6.0 | Test runner | Modern, fast test framework compatible with TypeScript. |
| **Containerization**| Docker | Latest | Application containerization & environment consistency | Ensures portability and consistent deployments. |
| **Linting** | ESLint | \~9.5 | Code quality and consistency | Enforces a consistent coding style across the monorepo. |
| **Formatting** | Prettier | \~3.3 | Automated code formatting | Works with ESLint to maintain a clean and readable codebase. |
| **CI/CD**| GitHub Actions | - | Continuous Integration & Deployment | Automates testing, builds, and deployments. |

---

### **4. Source Tree**

The source tree reflects a clean separation of concerns between the core application (`apps/mcp-server`) and shared logic (`packages`), managed by **Turborepo**.

```plaintext
project-concord/
├── apps/
│   └── mcp-server/               # The core MCP server application
│       ├── src/
│       │   ├── config/           # Configuration loading logic
│       │   ├── mcp-server/
│       │   │   ├── tools/        # MCP tool implementations (e.g., build_query_from_description)
│       │   │   └── transports/   # Handlers for protocols (HTTP, stdio) and Auth
│       │   ├── services/         # Business logic (dataContract, db connections)
│       │   ├── utils/            # Shared utilities (custom logger, error handling)
│       │   └── index.ts          # Application entry point
│       ├── tests/
│       └── Dockerfile
├── packages/
│   ├── data-contract/            # Shared package for the data contract
│   │   ├── src/
│   │   └── datacontract.yml      # The single source of truth for schema definitions
│   ├── eslint-config/            # Shared ESLint configuration
│   └── typescript-config/        # Shared tsconfig.json settings
├── .github/
│   └── workflows/                # GitHub Actions for CI/CD
└── ... (other packages, docs, etc.)
```

---

### **5. Data Models and Schema**

Project Concord does not define its own database schema for application data. Its architectural approach is as follows:

1.  **Dynamic Discovery**: Discover the legacy schema via the **Schema Debt Audit**.
2.  **Schema Caching**: Cache the discovered raw schema locally in a file to ensure fast startups and reduce load on the legacy system.
3.  **Semantic Layering**: The server uses the `datacontract.yml` to map the cached schema to business-friendly definitions at runtime.
4.  **No Direct Modification**: Enforce a strict read-only interaction policy with the legacy database.

Clean, enriched TypeScript interfaces corresponding to the Data Contract will be stored in the shared `packages/data-contract` to ensure type safety.

---

### **6. Data Contract Governance**

  * **Validation:** The project includes a script (`packages/data-contract/src/validate-contract.ts`) to validate the `datacontract.yml`.
  * **Change Management:** The PRD requires a formal review process for any changes to the data contract, involving a designated Data Steward.
  * **Architect's Recommendation:** This validation script should be integrated into a pre-commit hook (e.g., using Husky) to automate enforcement of the governance workflow.

---

### **7. API Specification**

The server's API will strictly adhere to the **Model Context Protocol (MCP)**, which uses JSON-RPC 2.0. The core of the specification is the definition of the **Tools** the server exposes to the AI agent. These tool definitions, including their **Input Validation Schemas**, will be a formal part of our `datacontract.yml`.

---

### **8. Security**

  * **Authentication & Authorization:** The server implements a flexible authentication factory (`apps/mcp-server/src/mcp-server/transports/auth/authFactory.ts`) that can support multiple strategies (JWT, OAuth).
  * **Read-Only Access:** The fundamental security principle is that all database operations are strictly read-only, enforced by granting the database user account only read permissions.
  * **Credential Management**: Database credentials will be loaded from environment variables, injected from a secrets management service in production.
  * **Architect's Recommendations:**
      * **Input Validation:** The project should adopt a library like **Zod** to define and enforce schemas for all tool inputs.
      * **Security Headers:** Implement a middleware like **Helmet.js** to set security-related HTTP headers.
      * **Dependency Scanning:** Integrate **Dependabot** or **Snyk** into the CI pipeline in `ci.yml` to automatically scan for vulnerabilities.
      * **Rate Limiting:** Implement a rate-limiting middleware to protect the server from abuse.

---

### **9. Error Handling and Observability**

  * **Error Handling:** The system uses a custom centralized error handler for the HTTP transport (`apps/mcp-server/src/mcp-server/transports/http/httpErrorHandler.ts`).
  * **Logging:** A custom structured logger is implemented (`apps/mcp-server/src/utils/internal/logger.ts`), which meets the PRD's observability requirement.
  * **Auditing:** Both the HTTP logging middleware and the database query executor include logging, fulfilling the requirement for a complete audit trail of requests and executed SQL queries.
  * **Architect's Recommendations:**
      * **Observability:** To mature the system, instrument the application with **OpenTelemetry** to provide distributed tracing and expose key metrics (e.g., request latency, error rates) via a `/metrics` endpoint for collection by a system like Prometheus.

---

### **10. Development Workflow**

The local development process will be managed via npm scripts in the root `package.json`. The process includes cloning the repository, installing dependencies with `npm install`, configuring a local `.env` file using the `dotenv` package, and using `docker-compose` to run local instances of the test database and any other required services like Redis.

---

### **11. Deployment Architecture**

The server will be deployed as a **Docker container**. A **GitHub Actions CI/CD pipeline** will be used to automatically test, build, and push a versioned container image to a registry. Deployments to Staging will be automatic on merge to `main`, while Production deployments will require a manual trigger.

---

### **12. Scalability and Performance**

  * **Tool Extensibility:** The server registers tools manually in `apps/mcp-server/src/mcp-server/server.ts`. This pattern is clean and extensible, allowing new tools to be added easily.
  * **Database Connection Management:** The `dbConnectionManager.ts` service will be enhanced to manage a robust connection pool for the production legacy database.
  * **Query Analysis**: Observability logs will be used to identify and analyze slow or inefficient SQL queries generated by the AI.
  * **Architect's Recommendations:**
      * **Caching:** The `redis.ts` service file exists but is not fully implemented. To reduce load on the legacy database, this should be fully implemented using a cache-aside pattern to store semantic mappings.
      * **Configuration:** The current `dotenv` setup is sufficient for local development. For production, a hierarchical configuration library like `config` should be adopted to manage environment-specific settings more robustly.

---

### **13. Testing Strategy**

The project will adhere to the "Full Testing Pyramid" requirement from the PRD, implemented with a multi-layered strategy using **Vitest**:

  * **Unit Tests**: Testing individual functions and classes in isolation, mocking all external dependencies.
  * **Integration Tests**: Using Vitest with the containerized test database (**PostgreSQL**) to verify the interactions between the server's internal components.
  * **End-to-End (E2E) Tests**: Using a test script to validate the server's logic deterministically (Layer 1) and then to benchmark performance with a real AI agent (Layer 2).