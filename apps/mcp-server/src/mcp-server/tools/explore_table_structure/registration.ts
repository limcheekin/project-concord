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
  exploreTableStructureInputSchema,
  exploreTableStructureOutputSchema,
  exploreTableStructureLogic,
} from './logic.js';
import { ErrorHandler } from '../../../utils/internal/errorHandler.js';
import { DataContract } from 'data-contract';
import { requestContextService, measureToolExecution } from '../../../utils/index.js';

export function registerExploreTableStructure(server: McpServer, contract: DataContract) {
  server.registerTool(
    'explore_table_structure',
    {
      title: 'Explore Table Structure',
      description: 'Explores the structure of a table, returning its columns and their properties.',
      inputSchema: exploreTableStructureInputSchema.shape,
      outputSchema: exploreTableStructureOutputSchema.shape,
    },
    async (params: any, callContext: Record<string, unknown>) => {
      const handlerContext = requestContextService.createRequestContext({
        parentContext: callContext,
        operation: "HandleToolRequest",
        toolName: 'explore_table_structure',
        input: params,
      });
      try {
        const validatedInput = exploreTableStructureInputSchema.parse(params);
        const result = await measureToolExecution(
            () => exploreTableStructureLogic(contract, validatedInput),
            { ...handlerContext, toolName: 'explore_table_structure' },
            validatedInput
        );
        const validatedOutput = exploreTableStructureOutputSchema.parse(result);

        return {
          structuredContent: validatedOutput,
          content: [
            {
              type: "text" as const,
              text: `Table structure for ${validatedInput.tableName}: ${JSON.stringify(validatedOutput, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        const handledError = ErrorHandler.handleError(error, {
          operation: 'explore_table_structure',
          context: handlerContext,
          input: params,
        });
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error: ${handledError.message}` }],
          structuredContent: {
            error: handledError.message,
          },
        };
      }
    }
  );
}
