/**
 * Copyright (c) 2025 Lim Chee Kin
 *
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the LICENSE file in the root directory
 * of this source tree or from the following URL:
 *
 *     https://github.com/limcheekin/project-concord/blob/main/LICENSE
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Tests for the main MCP server entry point.
 * @module tests/mcp-server/server.test
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "../../src/config/index.js";
import { initializeAndStartServer } from "../../src/mcp-server/server.js";
import { startStdioTransport } from "../../src/mcp-server/transports/stdio/index.js";
import { startHttpTransport } from "../../src/mcp-server/transports/http/index.js";
import { ErrorHandler } from "../../src/utils/index.js";
import { registerEchoResource } from "../../src/mcp-server/resources/echoResource/index.js";
import { registerEchoTool } from "../../src/mcp-server/tools/echoTool/index.js";
import { registerBuildQueryFromDescription } from '../../src/mcp-server/tools/build_query_from_description/registration.js';
import { registerExploreTableStructure } from '../../src/mcp-server/tools/explore_table_structure/registration.js';
import { registerExplainColumnMeaning } from '../../src/mcp-server/tools/explain_column_meaning/registration.js';
import { registerExpandAbbreviations } from '../../src/mcp-server/tools/expand_abbreviations/registration.js';
import { getDataContract } from '../../src/services/dataContract.js';
  
// Mock dependencies
vi.mock("@modelcontextprotocol/sdk/server/mcp.js", () => {
  const McpServer = vi.fn().mockImplementation(() => ({
    registerTool: vi.fn(),
    registerResource: vi.fn(),
    connect: vi.fn(), // Add the connect method to the mock
  }));
  return { McpServer };
});

vi.mock("../../src/config/index.js", async () => {
  return {
    config: {
      mcpServerName: "test-server",
      mcpServerVersion: "1.0.0",
      mcpTransportType: "stdio", // Default for tests
    },
    environment: "test",
  };
});

vi.mock("../../src/utils/index.js", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../src/utils/index.js")>();
  return {
    ...(original as Record<string, unknown>),
    logger: {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      crit: vi.fn(),
    },
    ErrorHandler: {
      handleError: vi.fn(),
      tryCatch: vi.fn(async (fn) => fn()),
    },
    requestContextService: {
      createRequestContext: vi.fn((ctx) => ({ ...ctx, id: "test-request-id" })),
      configure: vi.fn(),
    },
  };
});

vi.mock("../../src/mcp-server/resources/echoResource/index.js", () => ({
  registerEchoResource: vi.fn(),
}));

vi.mock("../../src/mcp-server/tools/catFactFetcher/index.js", () => ({
  registerCatFactFetcherTool: vi.fn(),
}));

vi.mock("../../src/mcp-server/tools/echoTool/index.js", () => ({
  registerEchoTool: vi.fn(),
}));

vi.mock("../../src/mcp-server/tools/imageTest/index.js", () => ({
  registerFetchImageTestTool: vi.fn(),
}));

vi.mock("../../src/mcp-server/transports/stdio/index.js");
vi.mock("../../src/mcp-server/transports/http/index.js");

vi.mock("../../src/mcp-server/tools/build_query_from_description/registration.js", () => ({
  registerBuildQueryFromDescription: vi.fn(),
}));

vi.mock("../../src/mcp-server/tools/explore_table_structure/registration.js", () => ({
  registerExploreTableStructure: vi.fn(),
}));

vi.mock("../../src/mcp-server/tools/explain_column_meaning/registration.js", () => ({
  registerExplainColumnMeaning: vi.fn(),
}));

vi.mock("../../src/mcp-server/tools/expand_abbreviations/registration.js", () => ({
  registerExpandAbbreviations: vi.fn(),
}));

vi.mock("../../src/services/dataContract.js", () => ({
  getDataContract: vi.fn(),
}));


describe("MCP Server Initialization", () => {
  let exitSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.exit to prevent tests from terminating the process
    exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it("should initialize and start with stdio transport", async () => {
    config.mcpTransportType = "stdio";
    await initializeAndStartServer();
    expect(McpServer).toHaveBeenCalledTimes(1);
    expect(startStdioTransport).toHaveBeenCalledTimes(1);
    expect(startHttpTransport).not.toHaveBeenCalled();
    expect(registerEchoResource).toHaveBeenCalled();
    expect(registerEchoTool).toHaveBeenCalled();
    expect(registerBuildQueryFromDescription).toHaveBeenCalled();
    expect(registerExploreTableStructure).toHaveBeenCalled();
    expect(registerExplainColumnMeaning).toHaveBeenCalled();
    expect(registerExpandAbbreviations).toHaveBeenCalled();
    expect(getDataContract).toHaveBeenCalled();
  });

  it("should initialize and start with http transport", async () => {
    config.mcpTransportType = "http";
    await initializeAndStartServer();
    expect(startHttpTransport).toHaveBeenCalledTimes(1);
    // createMcpServerInstance is passed as a factory to startHttpTransport,
    // so McpServer constructor itself is not called directly in this test path.
    expect(McpServer).not.toHaveBeenCalled();
    expect(startStdioTransport).not.toHaveBeenCalled();
  });

  it("should throw an error for an unsupported transport type and exit", async () => {
    (config as unknown as { mcpTransportType: string }).mcpTransportType =
      "invalid";
    await initializeAndStartServer();
    expect(ErrorHandler.handleError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        operation: "initializeAndStartServer_Catch",
        critical: true,
      }),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should handle critical errors during initialization and exit", async () => {
    config.mcpTransportType = "stdio";
    const testError = new Error("Critical Failure");
    vi.mocked(startStdioTransport).mockRejectedValueOnce(testError);

    await initializeAndStartServer();

    expect(ErrorHandler.handleError).toHaveBeenCalledWith(
      testError,
      expect.objectContaining({
        operation: "initializeAndStartServer_Catch",
        critical: true,
      }),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should handle registration failures gracefully and exit", async () => {
    config.mcpTransportType = "stdio";
    const registrationError = new Error("Registration failed");
    vi.mocked(registerEchoTool).mockRejectedValueOnce(registrationError);

    await initializeAndStartServer();

    expect(ErrorHandler.handleError).toHaveBeenCalledWith(
      registrationError,
      expect.objectContaining({
        operation: "initializeAndStartServer_Catch",
        critical: true,
      }),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
