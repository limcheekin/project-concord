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

import { describe, it, expect } from 'vitest';
import { buildQueryFromDescriptionLogic } from '../../../src/mcp-server/tools/build_query_from_description/logic';
import { McpError } from '../../../src/utils/internal/mcpError';
import { BaseErrorCode } from '../../../src/types-global/BaseErrorCode';

describe('buildQueryFromDescriptionLogic', () => {
  const mockContract = {
    tables: {
      CUST_MST: {
        businessName: 'Customer',
        description: 'Stores master information about customers.',
        columns: {
          c_id: {
            businessName: 'Customer ID',
            description: 'Unique identifier for a customer.',
            dataType: 'INTEGER',
            businessRules: [],
          },
          c_name: {
            businessName: 'Customer Name',
            description: 'Full name of the customer.',
            dataType: 'VARCHAR(100)',
            businessRules: [],
          },
        },
      },
    },
    abbreviations: {},
    tools: {},
  };

  it('should return a SQL query for a supported description', async () => {
    const input = { description: 'show me the customer name for the customer with id 123' };
    const result = await buildQueryFromDescriptionLogic(mockContract as any, input);
    expect(result).toEqual({
      sql_query: 'SELECT c_name FROM CUST_MST WHERE c_id = ?;',
      params: ['123'],
    });
  });

  it('should throw an error for an unsupported description', async () => {
    const input = { description: 'This is not a supported query.' };
    await expect(buildQueryFromDescriptionLogic(mockContract as any, input)).rejects.toThrow(McpError);
    await expect(buildQueryFromDescriptionLogic(mockContract as any, input)).rejects.toHaveProperty('code', BaseErrorCode.UNSUPPORTED_OPERATION);
  });
});
