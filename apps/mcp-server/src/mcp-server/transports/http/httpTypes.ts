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
 * @fileoverview Defines custom types for the Hono HTTP transport layer.
 * @module src/mcp-server/transports/http/httpTypes
 */

import type { IncomingMessage, ServerResponse } from "http";

/**
 * Extends Hono's Bindings to include the raw Node.js request and response objects.
 * This is necessary for integrating with libraries like the MCP SDK that
 * need to write directly to the response stream.
 *
 * As per `@hono/node-server`, the response object is available on `c.env.outgoing`.
 */
export type HonoNodeBindings = {
  incoming: IncomingMessage;
  outgoing: ServerResponse;
};
