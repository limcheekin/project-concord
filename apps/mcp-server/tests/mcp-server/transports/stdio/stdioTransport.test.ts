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
 * @fileoverview Tests for the Stdio MCP transport setup.
 * @module tests/mcp-server/transports/stdio/stdioTransport.test
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { startStdioTransport } from "../../../../src/mcp-server/transports/stdio/stdioTransport.js";
import { McpError } from "../../../../src/types-global/errors.js";
import { requestContextService } from "../../../../src/utils/index.js";

// Mock SDK classes
vi.mock("@modelcontextprotocol/sdk/server/mcp.js");
vi.mock("@modelcontextprotocol/sdk/server/stdio.js");

describe("startStdioTransport", () => {
  let mockServer: McpServer;
  const context = requestContextService.createRequestContext({
    toolName: "test",
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = new (vi.mocked(McpServer))({ name: "test", version: "1" });
  });

  it("should create a StdioServerTransport instance and connect the server", async () => {
    await startStdioTransport(mockServer, context);

    expect(StdioServerTransport).toHaveBeenCalledOnce();
    expect(mockServer.connect).toHaveBeenCalledWith(
      expect.any(StdioServerTransport),
    );
  });

  it("should re-throw an McpError if server.connect fails", async () => {
    const connectionError = new Error("Connection failed");
    vi.mocked(mockServer.connect).mockRejectedValue(connectionError);

    await expect(startStdioTransport(mockServer, context)).rejects.toThrow(
      McpError,
    );
  });
});
