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

// File: apps/mcp-server/tests/mcp-server/tools/expand_abbreviations/registration.test.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerExpandAbbreviations } from "../../../../src/mcp-server/tools/expand_abbreviations/registration.js";
import { DataContract } from "data-contract";

// DO NOT mock the logic file
// vi.mock("../../../../src/mcp-server/tools/expand_abbreviations/logic.js");

type ToolHandler = (params: any, callContext: Record<string, unknown>) => Promise<any>;

describe("Expand Abbreviations Tool Integration Test", () => {
  let handler: ToolHandler;
  let mockDataContract: DataContract;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDataContract = {
      tables: {},
      abbreviations: {
        "CUST": "Customer",
        "MST": "Master"
      },
      tools: {},
    };

    const server = new McpServer({ name: "test-server", version: "1.0.0" });
    vi.spyOn(server, "registerTool").mockImplementation((_name, _metadata, toolHandler) => {
      handler = toolHandler;
      return {} as any;
    });

    registerExpandAbbreviations(server, mockDataContract);
  });

  it("handler should call the real logic and return a successful expansion", async () => {
    const mockInput = { abbreviation: "CUST" };

    const result = await handler(mockInput, {});

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.expansion).toBe("Customer");
  });

  it("handler should return a formatted error for an unknown abbreviation", async () => {
    const mockInput = { abbreviation: "UNKNOWN" };

    const result = await handler(mockInput, {});

    expect(result.isError).toBe(true);
    expect(result.structuredContent.error).toContain("Abbreviation not found: UNKNOWN");
  });
});
