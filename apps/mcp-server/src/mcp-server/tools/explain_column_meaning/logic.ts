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

import { z } from 'zod';
import { McpError } from '../../../utils/internal/mcpError.js';
import { BaseErrorCode } from '../../../types-global/BaseErrorCode.js';
import { DataContract } from 'data-contract';

export const explainColumnMeaningInputSchema = z.object({
  tableName: z.string(),
  columnName: z.string(),
});

export const explainColumnMeaningOutputSchema = z.object({
  businessName: z.string(),
  description: z.string(),
  businessRules: z.array(z.string()),
});

export async function explainColumnMeaningLogic(
  contract: DataContract,
  input: z.infer<typeof explainColumnMeaningInputSchema>
): Promise<z.infer<typeof explainColumnMeaningOutputSchema>> {
  const table = contract.tables[input.tableName];
  if (!table) {
    throw new McpError(BaseErrorCode.NOT_FOUND, `Table not found: ${input.tableName}`);
  }

  const column = table.columns[input.columnName];
  if (!column) {
    throw new McpError(BaseErrorCode.NOT_FOUND, `Column not found: ${input.columnName} in table ${input.tableName}`);
  }

  const { businessName, description, businessRules } = column;
  // Return a new object with the relevant fields
  return { businessName, description, businessRules: businessRules || [] };
}
