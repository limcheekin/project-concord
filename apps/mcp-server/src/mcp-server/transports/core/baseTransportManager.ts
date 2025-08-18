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
 * @fileoverview Abstract base class for transport managers.
 * @module src/mcp-server/transports/core/baseTransportManager
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IncomingHttpHeaders } from "http";
import {
  logger,
  RequestContext,
  requestContextService,
} from "../../../utils/index.js";
import { TransportManager, TransportResponse } from "./transportTypes.js";

/**
 * Abstract base class for transport managers, providing common functionality.
 */
export abstract class BaseTransportManager implements TransportManager {
  protected readonly createServerInstanceFn: () => Promise<McpServer>;

  constructor(createServerInstanceFn: () => Promise<McpServer>) {
    const context = requestContextService.createRequestContext({
      operation: "BaseTransportManager.constructor",
      managerType: this.constructor.name,
    });
    logger.debug("Initializing transport manager.", context);
    this.createServerInstanceFn = createServerInstanceFn;
  }

  abstract handleRequest(
    headers: IncomingHttpHeaders,
    body: unknown,
    context: RequestContext,
    sessionId?: string,
  ): Promise<TransportResponse>;

  abstract shutdown(): Promise<void>;
}
