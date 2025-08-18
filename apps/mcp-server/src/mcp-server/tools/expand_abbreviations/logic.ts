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

export const expandAbbreviationsInputSchema = z.object({
  abbreviation: z.string(),
});

export const expandAbbreviationsOutputSchema = z.object({
  expansion: z.string(),
});

export async function expandAbbreviationsLogic(
  contract: DataContract,
  input: z.infer<typeof expandAbbreviationsInputSchema>
): Promise<z.infer<typeof expandAbbreviationsOutputSchema>> {
  const expansion = contract.abbreviations?.[input.abbreviation];
  if (!expansion) {
    throw new McpError(BaseErrorCode.NOT_FOUND, `Abbreviation not found: ${input.abbreviation}`);
  }
  return { expansion };
}
