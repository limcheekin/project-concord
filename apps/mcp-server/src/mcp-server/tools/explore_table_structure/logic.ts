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

export const exploreTableStructureInputSchema = z.object({
  tableName: z.string(),
});

export const exploreTableStructureOutputSchema = z.object({
  tableName: z.string(),
  businessName: z.string(),
  description: z.string(),
  columns: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string().optional(),
    nullable: z.boolean().optional(),
  })).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function exploreTableStructureLogic(
  contract: DataContract,
  input: z.infer<typeof exploreTableStructureInputSchema>
): Promise<z.infer<typeof exploreTableStructureOutputSchema>> { // Return the correct inferred type
  const table = contract.tables[input.tableName];
  if (!table) {
    throw new McpError(BaseErrorCode.NOT_FOUND, `Table not found: ${input.tableName}`);
  }

  // Transform the columns object into an array of objects
  const columnsAsArray = Object.entries(table.columns).map(([columnName, columnDetails]) => ({
    name: columnName,
    type: columnDetails.dataType, // Ensure you're mapping the correct property
    description: columnDetails.description,
  }));

  // Build the final object that matches the schema structure
  return {
    tableName: input.tableName,
    businessName: table.businessName,
    description: table.description,
    columns: columnsAsArray,
  };
}
