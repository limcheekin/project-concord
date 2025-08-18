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
 * @fileoverview Tests for the Supabase client singleton.
 * @module tests/services/supabase/supabaseClient.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BaseErrorCode, McpError } from "../../../src/types-global/errors.js";

// Mock the supabase-js library
const mockCreateClient = vi.fn((_url, _key) => ({
  from: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: mockCreateClient,
}));

describe("Supabase Client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("should initialize both clients when all config is present", async () => {
    vi.doMock("../../../src/config/index.js", () => ({
      config: {
        supabase: {
          url: "https://test.supabase.co",
          anonKey: "test-anon-key",
          serviceRoleKey: "test-service-role-key",
        },
      },
    }));

    await import("../../../src/services/supabase/supabaseClient.js");

    expect(mockCreateClient).toHaveBeenCalledTimes(2);
    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.any(Object),
    );
    expect(mockCreateClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-service-role-key",
      expect.any(Object),
    );
  });

  it("should return the initialized Supabase client", async () => {
    vi.doMock("../../../src/config/index.js", () => ({
      config: {
        supabase: {
          url: "https://test.supabase.co",
          anonKey: "test-anon-key",
          serviceRoleKey: "test-service-role-key",
        },
      },
    }));

    const { getSupabaseClient } = await import(
      "../../../src/services/supabase/supabaseClient.js"
    );
    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(client.from).toBeTypeOf("function");
  });

  it("should return the initialized Supabase admin client", async () => {
    vi.doMock("../../../src/config/index.js", () => ({
      config: {
        supabase: {
          url: "https://test.supabase.co",
          anonKey: "test-anon-key",
          serviceRoleKey: "test-service-role-key",
        },
      },
    }));

    const { getSupabaseAdminClient } = await import(
      "../../../src/services/supabase/supabaseClient.js"
    );
    const adminClient = getSupabaseAdminClient();
    expect(adminClient).toBeDefined();
    expect(adminClient.from).toBeTypeOf("function");
  });

  it("should throw an error if the client is not initialized", async () => {
    vi.doMock("../../../src/config/index.js", () => ({
      config: { supabase: {} },
    }));

    const { getSupabaseClient } = await import(
      "../../../src/services/supabase/supabaseClient.js"
    );

    try {
      getSupabaseClient();
      // Fail test if no error is thrown
      expect.fail("Expected getSupabaseClient to throw an error");
    } catch (error) {
      const mcpError = error as McpError;
      expect(mcpError.name).toBe("McpError");
      expect(mcpError.code).toBe(BaseErrorCode.SERVICE_NOT_INITIALIZED);
      expect(mcpError.message).toContain(
        "Supabase client has not been initialized",
      );
    }
  });

  it("should throw an error if the admin client is not initialized", async () => {
    vi.doMock("../../../src/config/index.js", () => ({
      config: {
        supabase: {
          url: "https://test.supabase.co",
          anonKey: "test-anon-key",
          // Missing serviceRoleKey
        },
      },
    }));

    const { getSupabaseAdminClient } = await import(
      "../../../src/services/supabase/supabaseClient.js"
    );

    try {
      getSupabaseAdminClient();
      // Fail test if no error is thrown
      expect.fail("Expected getSupabaseAdminClient to throw an error");
    } catch (error) {
      const mcpError = error as McpError;
      expect(mcpError.name).toBe("McpError");
      expect(mcpError.code).toBe(BaseErrorCode.SERVICE_NOT_INITIALIZED);
      expect(mcpError.message).toContain(
        "Supabase admin client has not been initialized",
      );
    }
  });
});
