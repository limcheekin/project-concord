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
import { exploreTableStructureLogic } from '../../../src/mcp-server/tools/explore_table_structure/logic';
import { McpError } from '../../../src/utils/internal/mcpError';
import { BaseErrorCode } from '../../../src/types-global/BaseErrorCode';

describe('exploreTableStructureLogic', () => {
  const mockContract = {
    tables: {
      'users': {
        businessName: 'Users Table',
        description: 'Table containing user information',
        columns: {
          'id': { businessName: 'ID', description: 'User ID', dataType: 'INTEGER', businessRules: [] },
          'name': { businessName: 'Name', description: 'User Name', dataType: 'TEXT', businessRules: [] },
        },
      },
    },
    abbreviations: {},
    tools: {},
  };

  it('should return the structure of an existing table', async () => {
    const input = { tableName: 'users' };
    const result = await exploreTableStructureLogic(mockContract, input);
    const expected = {
      tableName: 'users',
      businessName: 'Users Table',
      description: 'Table containing user information',
      columns: [
        { name: 'id', type: 'INTEGER', description: 'User ID' },
        { name: 'name', type: 'TEXT', description: 'User Name' },
      ],
    };
    expect(result).toEqual(expected);
  });

  it('should throw an error for a non-existent table', async () => {
    const input = { tableName: 'products' };
    await expect(exploreTableStructureLogic(mockContract, input)).rejects.toThrow(McpError);
    await expect(exploreTableStructureLogic(mockContract, input)).rejects.toHaveProperty('code', BaseErrorCode.NOT_FOUND);
  });
});
