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
  explainColumnMeaningInputSchema,
  explainColumnMeaningOutputSchema,
  explainColumnMeaningLogic,
} from './logic.js';
import { ErrorHandler } from '../../../utils/internal/errorHandler.js';
import { DataContract } from 'data-contract';
import { requestContextService, measureToolExecution } from '../../../utils/index.js';

export function registerExplainColumnMeaning(server: McpServer, contract: DataContract) {
  server.registerTool(
    'explain_column_meaning',
    {
      title: 'Explain Column Meaning',
      description: 'Explains the meaning of a column, including its business name, description, and business rules.',
      inputSchema: explainColumnMeaningInputSchema.shape,
      outputSchema: explainColumnMeaningOutputSchema.shape,
    },
    async (params: any, callContext: Record<string, unknown>) => {
      const handlerContext = requestContextService.createRequestContext({
        parentContext: callContext,
        operation: "HandleToolRequest",
        toolName: 'explain_column_meaning',
        input: params,
      });
      try {
        const validatedInput = explainColumnMeaningInputSchema.parse(params);
        const result = await measureToolExecution(
            () => explainColumnMeaningLogic(contract, validatedInput),
            { ...handlerContext, toolName: 'explain_column_meaning' },
            validatedInput
        );
        const validatedOutput = explainColumnMeaningOutputSchema.parse(result);

        return {
          structuredContent: validatedOutput,
          content: [
            {
              type: "text" as const,
              text: `Column meaning for ${validatedInput.tableName}.${validatedInput.columnName}: ${JSON.stringify(validatedOutput, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        const handledError = ErrorHandler.handleError(error, {
          operation: 'explain_column_meaning',
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
