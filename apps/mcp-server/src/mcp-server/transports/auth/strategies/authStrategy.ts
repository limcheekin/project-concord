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
 * @fileoverview Defines the interface for all authentication strategies.
 * This interface establishes a contract for verifying authentication tokens,
 * ensuring that any authentication method (JWT, OAuth, etc.) can be used
 * interchangeably by the core authentication middleware.
 * @module src/mcp-server/transports/auth/strategies/AuthStrategy
 */
import type { AuthInfo } from "../lib/authTypes.js";

export interface AuthStrategy {
  /**
   * Verifies an authentication token.
   * @param token The raw token string extracted from the request.
   * @returns A promise that resolves with the AuthInfo on successful verification.
   * @throws {McpError} if the token is invalid, expired, or fails verification for any reason.
   */
  verify(token: string): Promise<AuthInfo>;
}
