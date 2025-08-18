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
 * @fileoverview Tests for the requestContextService utility.
 * @module tests/utils/internal/requestContext.test
 */
import { describe, it, expect, beforeEach } from "vitest";
import { requestContextService } from "../../../src/utils/internal/requestContext";

describe("requestContextService", () => {
  beforeEach(() => {
    // Reset config before each test
    requestContextService.configure({});
  });

  describe("createRequestContext", () => {
    it("should create a basic request context with requestId and timestamp", () => {
      const context = requestContextService.createRequestContext();
      expect(context).toHaveProperty("requestId");
      expect(context).toHaveProperty("timestamp");
      expect(typeof context.requestId).toBe("string");
      expect(typeof context.timestamp).toBe("string");
    });

    it("should include additional context properties", () => {
      const additionalContext = {
        userId: "user-123",
        operation: "testOperation",
      };
      const context =
        requestContextService.createRequestContext(additionalContext);
      expect(context).toMatchObject(additionalContext);
    });
  });

  describe("configure and getConfig", () => {
    it("should start with an empty configuration", () => {
      const config = requestContextService.getConfig();
      expect(config).toEqual({});
    });

    it("should update the configuration", () => {
      const newConfig = { settingA: "valueA" };
      requestContextService.configure(newConfig);
      const config = requestContextService.getConfig();
      expect(config).toEqual(newConfig);
    });

    it("should merge new configuration with existing configuration", () => {
      requestContextService.configure({ settingA: "valueA" });
      requestContextService.configure({ settingB: "valueB" });
      const config = requestContextService.getConfig();
      expect(config).toEqual({ settingA: "valueA", settingB: "valueB" });
    });

    it("should return a copy of the configuration, not a reference", () => {
      const newConfig = { settingA: "valueA" };
      requestContextService.configure(newConfig);
      const config = requestContextService.getConfig();
      config.settingA = "modified";
      const originalConfig = requestContextService.getConfig();
      expect(originalConfig.settingA).toBe("valueA");
    });
  });
});
