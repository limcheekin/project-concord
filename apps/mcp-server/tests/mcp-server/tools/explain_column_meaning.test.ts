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
import { explainColumnMeaningLogic } from '../../../src/mcp-server/tools/explain_column_meaning/logic';
import { McpError } from '../../../src/utils/internal/mcpError';
import { BaseErrorCode } from '../../../src/types-global/BaseErrorCode';

describe('explainColumnMeaningLogic', () => {
  const mockContract = {
    tables: {
      'users': {
        businessName: 'Users',
        description: 'Table containing user information',
        columns: {
          'id': { businessName: 'ID', description: 'User ID', dataType: 'number', businessRules: [] },
          'name': { businessName: 'Name', description: 'User Name', dataType: 'string', businessRules: ['Cannot be null'] },
        },
      },
    },
    abbreviations: {},
    tools: {},
  };

  it('should return the meaning of an existing column', async () => {
    const input = { tableName: 'users', columnName: 'name' };
    const result = await explainColumnMeaningLogic(mockContract, input);
    expect(result).toEqual({
      businessName: 'Name',
      description: 'User Name',
      businessRules: ['Cannot be null'],
    });
  });

  it('should throw an error for a non-existent table', async () => {
    const input = { tableName: 'products', columnName: 'name' };
    await expect(explainColumnMeaningLogic(mockContract, input)).rejects.toThrow(McpError);
    await expect(explainColumnMeaningLogic(mockContract, input)).rejects.toHaveProperty('code', BaseErrorCode.NOT_FOUND);
  });

  it('should throw an error for a non-existent column', async () => {
    const input = { tableName: 'users', columnName: 'email' };
    await expect(explainColumnMeaningLogic(mockContract, input)).rejects.toThrow(McpError);
    await expect(explainColumnMeaningLogic(mockContract, input)).rejects.toHaveProperty('code', BaseErrorCode.NOT_FOUND);
  });
});
