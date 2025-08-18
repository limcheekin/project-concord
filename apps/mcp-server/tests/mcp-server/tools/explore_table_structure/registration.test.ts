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

// File: tests/mcp-server/tools/explore_table_structure/registration.test.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerExploreTableStructure } from "../../../../src/mcp-server/tools/explore_table_structure/registration.js";
import { DataContract } from "data-contract";

// DO NOT mock the logic file. We want to test the real integration.
// vi.mock("../../../../src/mcp-server/tools/explore_table_structure/logic.js");

type ToolHandler = (params: any, callContext: Record<string, unknown>) => Promise<any>;

describe("Explore Table Structure Tool Integration Test", () => {
  let server: McpServer;
  let handler: ToolHandler;
  let mockDataContract: DataContract;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Use a realistic mock data contract that matches the actual structure
    mockDataContract = {
      tables: {
        CUST_MST: {
          businessName: "Customer Master",
          description: "Contains customer details.",
          columns: {
            c_id: { businessName: "Customer ID", description: "Unique identifier", dataType: "INTEGER", businessRules: [] },
            c_name: { businessName: "Customer Name", description: "Full name", dataType: "VARCHAR", businessRules: [] },
          },
        },
      },
      abbreviations: {},
      tools: {},
    };

    server = new McpServer({ name: "test-server", version: "1.0.0" });

    // Spy on registerTool to capture the real handler
    vi.spyOn(server, "registerTool").mockImplementation((_name, _metadata, toolHandler) => {
      handler = toolHandler;
      return {} as any;
    });

    registerExploreTableStructure(server, mockDataContract);
  });

  it("handler should call the real logic and return a successfully transformed response", async () => {
    const mockInput = { tableName: "CUST_MST" };

    // Act: Call the handler, which will now execute the real logic
    const result = await handler(mockInput, {});

    // Assert: Verify the handler formatted the response correctly after real logic execution
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.tableName).toBe("CUST_MST");
    expect(result.structuredContent.businessName).toBe("Customer Master");
    expect(Array.isArray(result.structuredContent.columns)).toBe(true);
    expect(result.structuredContent.columns).toEqual([
      { name: 'c_id', type: 'INTEGER', description: 'Unique identifier' },
      { name: 'c_name', type: 'VARCHAR', description: 'Full name' }
    ]);
  });

  it("handler should return a formatted error when the logic function throws", async () => {
    const mockInput = { tableName: "FAKE_TABLE" }; // This table doesn't exist

    // Act: The real logic will now throw a NOT_FOUND error
    const result = await handler(mockInput, {});

    // Assert: Verify the handler caught the real error and formatted it
    expect(result.isError).toBe(true);
    expect(result.structuredContent.error).toContain("Table not found: FAKE_TABLE");
    expect(result.content[0].text).toContain("Table not found: FAKE_TABLE");
  });
});
