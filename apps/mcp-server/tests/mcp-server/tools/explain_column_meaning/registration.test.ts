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

// File: apps/mcp-server/tests/mcp-server/tools/explain_column_meaning/registration.test.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerExplainColumnMeaning } from "../../../../src/mcp-server/tools/explain_column_meaning/registration.js";
import { DataContract } from "data-contract";

// DO NOT mock the logic file
// vi.mock("../../../../src/mcp-server/tools/explain_column_meaning/logic.js");

type ToolHandler = (params: any, callContext: Record<string, unknown>) => Promise<any>;

describe("Explain Column Meaning Tool Integration Test", () => {
  let handler: ToolHandler;
  let mockDataContract: DataContract;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDataContract = {
      tables: {
        CUST_MST: {
          businessName: "Customer Master",
          description: "Contains customer details.",
          columns: {
            c_id: { businessName: "Customer ID", description: "Unique identifier for a customer", dataType: "INTEGER", businessRules: [] },
            c_name: { businessName: "Customer Name", description: "Full name of the customer", dataType: "VARCHAR", businessRules: ["Cannot be null"] },
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

    registerExplainColumnMeaning(server, mockDataContract);
  });

  it("handler should call the real logic and return a successful explanation", async () => {
    const mockInput = { tableName: "CUST_MST", columnName: "c_name" };

    const result = await handler(mockInput, {});

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.businessName).toBe("Customer Name");
    expect(result.structuredContent.description).toBe("Full name of the customer");
    expect(result.structuredContent.businessRules).toEqual(["Cannot be null"]);
  });

  it("handler should return a formatted error for an unknown table", async () => {
    const mockInput = { tableName: "FAKE_TABLE", columnName: "c_name" };

    const result = await handler(mockInput, {});

    expect(result.isError).toBe(true);
    expect(result.structuredContent.error).toContain("Table not found: FAKE_TABLE");
  });

  it("handler should return a formatted error for an unknown column", async () => {
    const mockInput = { tableName: "CUST_MST", columnName: "fake_column" };

    const result = await handler(mockInput, {});

    expect(result.isError).toBe(true);
    expect(result.structuredContent.error).toContain("Column not found: fake_column in table CUST_MST");
  });
});
