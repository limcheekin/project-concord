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

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  buildQueryFromDescriptionInputSchema,
  buildQueryFromDescriptionOutputSchema,
  buildQueryFromDescriptionLogic,
} from './logic.js';
import { ErrorHandler } from '../../../utils/internal/errorHandler.js';
import { DataContract } from 'data-contract';
import { requestContextService, measureToolExecution } from '../../../utils/index.js';


export function registerBuildQueryFromDescription(server: McpServer, contract: DataContract) {
  server.registerTool(
    'build_query_from_description',
    {
      title: 'Build Query From Description',
      description: 'Builds a SQL query from a natural language description.',
      inputSchema: buildQueryFromDescriptionInputSchema.shape,
      outputSchema: buildQueryFromDescriptionOutputSchema.shape,
    },
    async (params, callContext) => {
      const handlerContext = requestContextService.createRequestContext({
        parentContext: callContext,
        operation: "HandleToolRequest",
        toolName: 'build_query_from_description',
        input: params,
      });

      try {
        const parsed = buildQueryFromDescriptionInputSchema.parse(params);

        const result = await measureToolExecution(
          () => buildQueryFromDescriptionLogic(contract, parsed),
          { ...handlerContext, toolName: 'build_query_from_description' },
          parsed
        );

        const validatedOutput = buildQueryFromDescriptionOutputSchema.parse(result);

        // NFR3: Log the final, executed SQL query
        console.log({
          message: 'Generated SQL Query',
          requestId: handlerContext.requestId,
          sql: validatedOutput.sql_query,
          params: validatedOutput.params,
        });

        return {
          content: [{ type: 'text' as const, text: `Generated SQL: ${validatedOutput.sql_query}` }],
          structuredContent: validatedOutput,
        };
      } catch (err) {
        const handledError = ErrorHandler.handleError(err, {
          operation: 'build_query_from_description',
          context: handlerContext, // Use the new handlerContext
          input: params,
        });
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Error: ${handledError.message}` }],
          structuredContent: { error: handledError.message },
        };
      }
    }
  );
}
