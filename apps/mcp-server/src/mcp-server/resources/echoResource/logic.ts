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
 * @fileoverview Defines the core logic, schemas, and types for the `echo` resource.
 * @module src/mcp-server/resources/echoResource/logic
 * @see {@link src/mcp-server/resources/echoResource/registration.ts} for the handler and registration logic.
 */

import { z } from "zod";
import { logger, type RequestContext } from "../../../utils/index.js";

/**
 * Zod schema defining expected query parameters for the echo resource.
 */
export const EchoResourceQuerySchema = z.object({
  message: z
    .string()
    .optional()
    .describe(
      "Optional message to echo back in the response. If not provided, a default may be used or derived from the path.",
    ),
});

/**
 * TypeScript type inferred from the {@link EchoResourceQuerySchema}.
 */
export type EchoResourceParams = z.infer<typeof EchoResourceQuerySchema>;

/**
 * Defines the structure of the JSON payload returned by the `processEchoResource` function.
 */
export interface EchoResourceResponsePayload {
  message: string;
  timestamp: string;
  requestUri: string;
}

/**
 * Processes the core logic for an echo resource request.
 * @param uri - The full URL object of the incoming resource request.
 * @param params - The validated query parameters for the request.
 * @param context - The request context, used for logging and tracing the operation.
 * @returns The data payload for the response.
 */
export async function echoResourceLogic(
  uri: URL,
  params: EchoResourceParams,
  context: RequestContext,
): Promise<EchoResourceResponsePayload> {
  // The message can come from a query parameter or the path itself.
  // For a URI like `echo://my-message?param=1`, `hostname` is `my-message`.
  const messageFromPath = uri.hostname || uri.pathname.replace(/^\/+/g, "");
  const messageToEcho =
    params.message || messageFromPath || "Default echo message";

  logger.debug("Processing echo resource logic.", {
    ...context,
    resourceUri: uri.href,
    extractedMessage: messageToEcho,
  });

  const responsePayload: EchoResourceResponsePayload = {
    message: messageToEcho,
    timestamp: new Date().toISOString(),
    requestUri: uri.href,
  };

  logger.debug("Echo resource processed successfully.", {
    ...context,
    responsePayloadSummary: {
      messageLength: responsePayload.message.length,
    },
  });

  return responsePayload;
}
