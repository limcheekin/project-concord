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
 * @fileoverview Shared types for authentication middleware.
 * @module src/mcp-server/transports/auth/core/auth.types
 */

import type { AuthInfo as SdkAuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

/**
 * Defines the structure for authentication information derived from a token.
 * It extends the base SDK type to include common optional claims.
 */
export type AuthInfo = SdkAuthInfo & {
  subject?: string;
};

// The declaration for `http.IncomingMessage` is no longer needed here,
// as the new architecture avoids direct mutation where possible and handles
// the attachment within the Hono context.
