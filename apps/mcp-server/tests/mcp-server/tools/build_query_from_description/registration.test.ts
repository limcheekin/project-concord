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

// File: tests/mcp-server/tools/build_query_from_description/registration.test.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerBuildQueryFromDescription } from "../../../../src/mcp-server/tools/build_query_from_description/registration.js";
import { DataContract } from "data-contract";

// DO NOT mock the logic file
// vi.mock("../../../../src/mcp-server/tools/build_query_from_description/logic.js");

type ToolHandler = (params: any, callContext: Record<string, unknown>) => Promise<any>;

describe("Build Query From Description Tool Integration Test", () => {
  let handler: ToolHandler;
  let mockDataContract: DataContract;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDataContract = {
      tables: {
        CUST_MST: {
          businessName: 'Customer',
          description: 'Contains all customer details',
          columns: {
            c_id: { businessName: 'Customer ID', description: 'The unique identifier for a customer', dataType: 'INTEGER', businessRules: [] },
            c_name: { businessName: 'Customer Name', description: 'The full name of the customer', dataType: 'VARCHAR', businessRules: [] },
          },
        },
      },
      abbreviations: {},
      tools: {},
    };

    const server = new McpServer({ name: "test-server", version: "1.0.0" });
    vi.spyOn(server, "registerTool").mockImplementation((_name, _metadata, toolHandler) => {
      handler = toolHandler;
      return {} as any;
    });

    registerBuildQueryFromDescription(server, mockDataContract);
  });

  it("handler should call the real logic and return a successful SQL query", async () => {
    const mockInput = { description: "show me the customer name for the customer with id 123" };

    const result = await handler(mockInput, {});

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.sql_query).toBe("SELECT c_name FROM CUST_MST WHERE c_id = ?;");
    expect(result.structuredContent.params).toEqual(['123']);
  });

  it("handler should return a formatted error for an unsupported description", async () => {
    const mockInput = { description: "this is an unsupported query" };

    const result = await handler(mockInput, {});

    expect(result.isError).toBe(true);
    expect(result.structuredContent.error).toContain("That request is not supported");
  });
});
