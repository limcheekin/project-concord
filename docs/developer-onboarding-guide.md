# Developer Onboarding Guide: Project Concord

Welcome to Project Concord. This guide provides all the necessary information to set up your local development environment, understand our key processes, and start contributing.

### **1. Local Development Setup**

This section outlines the prerequisites and steps to get the Project Concord monorepo running on your local machine.

**Prerequisites:**
* Node.js (~20.x LTS)
* npm (comes with Node.js)
* Docker and Docker Compose
* Git

**Setup Steps:**
1.  Clone the repository from GitHub.
2.  Navigate to the root directory of the project.
3.  Install all dependencies using the command: `npm install`
4.  Configure your local environment by creating a `.env` file in the project root. Copy the contents of `.env.example` and populate it with the necessary credentials and configuration details.

### **2. Running the Test Environment**

Our testing strategy relies on a containerized, isolated clone of the legacy database. This ensures all testing is safe, reliable, and does not impact production systems. The database service, `db`, is a PostgreSQL instance, as defined in the `docker-compose.yml` file.

1.  **Start the environment:** To start the test database (PostgreSQL) and Redis cache, run the following command from the project root:
    ```bash
    docker compose up # or 'docker compose up -d' for detached mode
    ```
2.  **Seed the database:** To populate the test database with sanitized, representative data, run:
    ```bash
    npm run seed-test-db
    ```

### **3. Secure Access Protocol**

This protocol defines the requirements for securely connecting to the legacy database.

* **Credentials:** All database credentials must be loaded from environment variables and never hardcoded into the source code. Please see the `.env.example` file for the required variables.
* **Network Access:** The PostgreSQL database is not exposed to the public internet. It is only accessible from within the Docker network to the `mcp-server` service, ensuring a secure connection.

### **4. Toolchain Specification**

This specification defines the approved libraries and commands for core project tasks.

*   **Linting:** Code quality is maintained using ESLint. Run `npm run lint` to check for issues.
*   **Testing:** Unit and integration tests are run using Vitest. Run `npm run test` to execute the test suite.
*   **Schema Audit:** The schema audit script (`npm run audit-schema`) should be built using the libraries and patterns established in the `mcp-server` package.
*   **Type Checking:** TypeScript is used for static type checking. The `tsconfig.json` files in each package define the compiler options.

### **5. Data Contract Governance Workflow**

The `datacontract.yml` is the single source of truth for our schema's semantic definitions. Any changes to this file must follow this governance process:

1.  A developer creates a pull request with the proposed changes.
2.  The `npm run validate-contract` CI step must pass.
3.  The changes must be formally reviewed and approved by the stakeholders defined in the RACI matrix below.

**RACI Matrix:**
* **Responsible:** Data Steward
* **Accountable:** Head of Data Governance
* **Consulted:** Business Domain Experts, Lead Developer
* **Informed:** All Development Team members

### **6. E2E AI Assistant Integration**

This section provides detailed instructions for connecting a Reference AI Host to your locally running MCP server for end-to-end (E2E) testing.

* **Reference AI Host:** For consistency in E2E testing, the official target is **Claude Desktop v2.5**.

* **Configuration Steps:**

    1.  **Start the local MCP server:** From the project root, run the following command. This will start the server in HTTP mode, making it accessible to external tools.
        ```bash
        npm run dev:http --workspace=mcp-server
        ```
        By default, the server will be available at `http://localhost:8787`. Check the console output for the exact URL.

    2.  **Open Claude Desktop:** Launch the Claude Desktop application on your machine.

    3.  **Navigate to the Custom Tools Menu:**
        *   Go to the "Settings" or "Preferences" menu (this may vary depending on the exact version of the application).
        *   Find the section for "Tools" or "Custom Tools".

    4.  **Add a New Tool Configuration:**
        *   **Tool Name:** Give the tool a descriptive name, such as `Project Concord Local`.
        *   **Tool URL / Endpoint:** This is the critical step. You must provide the full URL to the server's tool definition endpoint. For a default local server, this will be:
            `http://localhost:8787/mcp/tools`
        *   **Authentication:**
            *   Set the authentication type to **"API Key"** or **"Bearer Token"**.
            *   Provide the secret API key that the AI will use to authenticate with your local server. This key must match the `MCP_SERVER_AUTH_KEY` value you have defined in your local `.env` file.

    5.  **Save and Enable the Tool:**
        *   Save the new tool configuration.
        *   Ensure the tool is enabled for use in your conversations with the AI assistant.

    6.  **Verify the Connection:**
        *   Start a new conversation with the AI assistant.
        *   Ask a simple question that should invoke one of the server's tools, for example: *"What tables are in the database?"*
        *   Check the console output of your running `mcp-server`. You should see log entries indicating that the server has received a request from the AI assistant.

By following these steps, you can perform manual E2E testing of the AI assistant's ability to correctly use the tools provided by the Project Concord server.

### **7. CI/CD Pipeline**

A foundational CI/CD pipeline is configured using GitHub Actions to ensure code quality and prevent regressions. The workflow runs automatically on all pushes and pull requests to the `main` branch. For details, please see the workflow file at `.github/workflows/ci.yml`.