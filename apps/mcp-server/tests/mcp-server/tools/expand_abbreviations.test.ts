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
import { expandAbbreviationsLogic } from '../../../src/mcp-server/tools/expand_abbreviations/logic';
import { McpError } from '../../../src/utils/internal/mcpError';
import { BaseErrorCode } from '../../../src/types-global/BaseErrorCode';

describe('expandAbbreviationsLogic', () => {
  const mockContract = {
    tables: {},
    abbreviations: {
      'DB': 'Database',
      'OS': 'Operating System',
    },
    tools: {},
  };

  it('should expand a known abbreviation', async () => {
    const input = { abbreviation: 'DB' };
    const result = await expandAbbreviationsLogic(mockContract, input);
    expect(result).toEqual({ expansion: 'Database' });
  });

  it('should throw an error for an unknown abbreviation', async () => {
    const input = { abbreviation: 'API' };
    await expect(expandAbbreviationsLogic(mockContract, input)).rejects.toThrow(McpError);
    await expect(expandAbbreviationsLogic(mockContract, input)).rejects.toHaveProperty('code', BaseErrorCode.NOT_FOUND);
  });

  it('should be case-sensitive', async () => {
    const input = { abbreviation: 'db' };
    await expect(expandAbbreviationsLogic(mockContract, input)).rejects.toThrow(McpError);
  });
});
