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
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { buildQueryFromDescriptionLogic } from '../../src/mcp-server/tools/build_query_from_description/logic';

// Function to parse the challenge questions from the Markdown file
const parseChallengeQuestions = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const questions = [];
  // Adjusted regex to be more robust
  const questionRegex = /\*\*Question:\*\*\s*"(.*?)"[\s\S]*?\*\*Expected SQL:\*\*\s*`([\s\S]*?)`/g;

  let match;
  while ((match = questionRegex.exec(content)) !== null) {
    questions.push({
      question: match[1].trim(),
      expectedSql: match[2].trim(),
    });
  }
  return questions;
};

describe('End-to-End Challenge Questions', () => {
  // Use relative paths from the current file to locate the project root and then the files.
  const projectRoot = path.resolve(__dirname, '../../../../');
  const contractPath = path.join(projectRoot, 'packages/data-contract/datacontract.yml');
  const contract: any = yaml.load(fs.readFileSync(contractPath, 'utf8'));

  const questionsPath = path.join(projectRoot, 'docs/e2e-challenge-questions.md');
  const challengeQuestions = parseChallengeQuestions(questionsPath);

  challengeQuestions.forEach(({ question, expectedSql }) => {
    if (expectedSql.includes('JOIN')) {
        it(`should throw a not supported error for: "${question}"`, async () => {
            const input = { description: question };
            await expect(buildQueryFromDescriptionLogic(contract, input)).rejects.toThrow(
                'That request is not supported by the query builder yet. Try rephrasing or pick from the supported set.'
            );
        });
    } else {
        it(`should generate the correct SQL for: "${question}"`, async () => {
            const input = { description: question };
            const { sql_query, params } = await buildQueryFromDescriptionLogic(contract, input);

            // Replace placeholders with params for a comparable string
            let resultQuery = sql_query;
            if(params) {
                let paramIndex = 0;
                resultQuery = sql_query.replace(/\?/g, () => `'${params[paramIndex++]}'`);
            }

            // Normalize SQL strings for comparison
            const normalize = (sql: string) => sql.replace(/\s+/g, ' ').replace(/;/g, '').trim();

            expect(normalize(resultQuery)).toBe(normalize(expectedSql));
        });
    }
  });
});
