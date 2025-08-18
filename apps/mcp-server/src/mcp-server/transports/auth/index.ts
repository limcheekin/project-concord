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
 * @fileoverview Barrel file for the auth module.
 * Exports core utilities and middleware strategies for easier imports.
 * @module src/mcp-server/transports/auth/index
 */

export { authContext } from "./lib/authContext.js";
export { withRequiredScopes } from "./lib/authUtils.js";
export type { AuthInfo } from "./lib/authTypes.js";

export { createAuthStrategy } from "./authFactory.js";
export { createAuthMiddleware } from "./authMiddleware.js";
export type { AuthStrategy } from "./strategies/authStrategy.js";
export { JwtStrategy } from "./strategies/jwtStrategy.js";
export { OauthStrategy } from "./strategies/oauthStrategy.js";
