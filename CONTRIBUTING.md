# Contributing to Project Concord

First of all, thank you for considering contributing to Project Concord! We welcome any contributions that help us improve the project, whether it's reporting a bug, proposing a new feature, or writing code.

This document provides guidelines for contributing to the project. Please read it carefully to ensure a smooth and effective contribution process.

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
  - [Running Tests](#running-tests)
  - [Running the Linter](#running-the-linter)
  - [Adding a New Tool](#adding-a-new-tool)
- [Pull Request Process](#pull-request-process)
  - [Branching Strategy](#branching-strategy)
  - [Commit Messages](#commit-messages)
  - [Submitting a Pull Request](#submitting-a-pull-request)

## Code of Conduct

This project and everyone participating in it is governed by a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior. (Note: A formal Code of Conduct file is forthcoming).

## How to Contribute

### Reporting Bugs

If you find a bug, please ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/limcheekin/project-concord/issues). If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/limcheekin/project-concord/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample or an executable test case** demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements

If you have an idea for an enhancement, please open an issue to discuss your ideas. This allows us to coordinate our efforts and prevent duplication of work.

## Getting Started

Before you start, please review the main `README.md` and the `docs/architecture.md` document to get a good understanding of the project's goals and architecture. For a more in-depth guide on the project setup and conventions, see the [Developer Onboarding Guide](./docs/developer-onboarding-guide.md).

To get your development environment set up, please follow the instructions in the [Getting Started](./README.md#-getting-started) section of the `README.md`.

## Development Workflow

### Running Tests

To run the full suite of tests, use the following command from the root of the repository:

```sh
npm test
```

### Running the Linter

To check your code for any linting issues, run:

```sh
npm run lint
```

### Adding a New Tool

One of the most common ways to contribute is by adding a new tool to the MCP server. Here is the standard workflow for doing so:

1.  **Create a Tool Directory:**
    Navigate to `apps/mcp-server/src/mcp-server/tools/` and create a new directory for your tool (e.g., `myNewTool`).

2.  **Define the Logic (`logic.ts`):**
    Inside your tool's directory, create a `logic.ts` file. This file is the heart of your tool and should contain:
    - **Zod Schemas:** Define Zod schemas for the tool's input and output. These schemas are critical as their descriptions are sent to the LLM.
    - **TypeScript Types:** Export inferred TypeScript types from your Zod schemas.
    - **Core Logic Function:** Write a pure, `async` function that contains the business logic for your tool. It should take the validated input and a `RequestContext` as parameters and return a structured response.

3.  **Register the Tool (`registration.ts`):**
    Create a `registration.ts` file in your tool's directory. This file connects your tool to the MCP server. It should:
    - Import the schemas and logic function from `logic.ts`.
    - Define a `TOOL_NAME` and `TOOL_DESCRIPTION`.
    - Export a registration function (e.g., `registerMyNewTool`) that takes the `McpServer` instance as a parameter.
    - In this function, call `server.registerTool()`, providing the tool's metadata and a handler function that calls your logic, handles errors, and formats the response.

4.  **Create a Barrel File (`index.ts`):**
    It's good practice to create an `index.ts` file in your tool's directory that exports the registration function from `registration.ts`.

5.  **Connect to the Server (`server.ts`):**
    Finally, you need to tell the server to load your new tool.
    - Open `apps/mcp-server/src/mcp-server/server.ts`.
    - Import your new tool's registration function at the top of the file.
    - In the `createMcpServerInstance` function, call your registration function, passing it the `server` instance (e.g., `await registerMyNewTool(server);`).

Please refer to the [best practices](https://github.com/cyanheads/mcp-ts-template/blob/main/docs/best-practices.md) document for more information.

## Pull Request Process

### Branching Strategy

Please create a new branch for your changes from the `main` branch. A good branch name would be `feat/my-new-feature` or `fix/my-bug-fix`.

### Commit Messages

All commit messages must follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/). This helps us automate changelogs and makes the commit history easier to read. For example:
- `feat: Add a new tool for currency conversion`
- `fix: Correct an issue with the echoTool logic`
- `docs: Update the CONTRIBUTING.md file`

### Submitting a Pull Request

Once your changes are ready, open a pull request against the `main` branch.
- Provide a clear title and a detailed description of your changes.
- Link to any relevant issues.
- Ensure that all tests and linting checks pass.
- Be ready to address any feedback from the code review.

Thank you for your contribution!
