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
 * @fileoverview Tests for the fetchWithTimeout utility using real HTTP endpoints.
 * @module tests/utils/network/fetchWithTimeout.test
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { fetchWithTimeout } from "../../../src/utils/network/fetchWithTimeout";
import { requestContextService } from "../../../src/utils";
import { McpError, BaseErrorCode } from "../../../src/types-global/errors";
import { server } from "../../mocks/server";

// Using httpbin.org for real HTTP testing
const HTTPBIN_BASE = "https://httpbin.org";

describe("fetchWithTimeout", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  const parentRequestContext = requestContextService.createRequestContext({
    toolName: "test-parent",
  });

  it("should successfully fetch data within the timeout", async () => {
    const response = await fetchWithTimeout(
      `${HTTPBIN_BASE}/json`,
      10000,
      parentRequestContext,
    );
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toHaveProperty("slideshow");
  });

  it("should throw a timeout error if the request takes too long", async () => {
    // httpbin.org/delay/2 takes 2 seconds, but we'll timeout after 1 second
    await expect(
      fetchWithTimeout(`${HTTPBIN_BASE}/delay/2`, 1000, parentRequestContext),
    ).rejects.toThrow(McpError);

    try {
      await fetchWithTimeout(
        `${HTTPBIN_BASE}/delay/2`,
        1000,
        parentRequestContext,
      );
    } catch (error) {
      const mcpError = error as McpError;
      expect(mcpError.code).toBe(BaseErrorCode.TIMEOUT);
      expect(mcpError.message).toContain("timed out");
    }
  });

  it("should handle HTTP error status codes gracefully", async () => {
    await expect(
      fetchWithTimeout(
        `${HTTPBIN_BASE}/status/500`,
        5000,
        parentRequestContext,
      ),
    ).rejects.toThrow(McpError);
  });

  it("should throw an McpError for network errors", async () => {
    // Use an invalid URL to trigger a network error
    await expect(
      fetchWithTimeout(
        "https://invalid-domain-that-does-not-exist.com",
        5000,
        parentRequestContext,
      ),
    ).rejects.toThrow(McpError);

    try {
      await fetchWithTimeout(
        "https://invalid-domain-that-does-not-exist.com",
        5000,
        parentRequestContext,
      );
    } catch (error) {
      const mcpError = error as McpError;
      expect(mcpError.code).toBe(BaseErrorCode.SERVICE_UNAVAILABLE);
      expect(mcpError.message).toContain("Network error");
    }
  });

  it("should handle POST requests correctly", async () => {
    const requestBody = { key: "value", test: true };

    const response = await fetchWithTimeout(
      `${HTTPBIN_BASE}/post`,
      10000,
      parentRequestContext,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );

    const responseData = await response.json();

    expect(response.ok).toBe(true);
    expect(responseData.json).toEqual(requestBody);
    expect(responseData.headers["Content-Type"]).toBe("application/json");
  });
});
