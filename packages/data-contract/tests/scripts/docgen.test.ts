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

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('docgen.ts', () => {
  const tempDir = path.resolve(process.cwd(), 'temp-docgen-test');
  const contractPath = path.join(tempDir, 'datacontract.yml');
  const generatedDir = path.join(tempDir, 'generated');
  const scriptPath = path.resolve(process.cwd(), 'scripts/docgen.ts');
  const tsxPath = path.resolve(
    process.cwd(),
    '../../node_modules/.bin/tsx',
  );

  beforeEach(() => {
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const runScript = (args: string[]) => {
    const command = `${tsxPath} ${scriptPath} ${args.join(' ')}`;
    try {
      return execSync(command, {
        encoding: 'utf-8',
        stdio: 'pipe', // Pipe stdout to the parent process
      });
    } catch (error) {
      // execSync throws an error with the process output
      // We can inspect the error object for stdout/stderr
      throw new Error(error.stdout + error.stderr);
    }
  };

  it('should generate documentation for a valid table', () => {
    const yamlContent = `
tables:
  cust_mst:
    businessName: Customer Master
    description: "The master table for customer data"
    columns:
      cust_id:
        businessName: Customer ID
        description: "Unique identifier for a customer"
        dataType: "INTEGER"
`;
    fs.writeFileSync(contractPath, yamlContent);

    const output = runScript([
      '--table',
      'cust_mst',
      '--contract',
      contractPath,
      '--output',
      generatedDir,
    ]);

    const expectedOutputPath = path.join(generatedDir, 'cust_mst.md');
    expect(output).toContain(
      `Documentation for table "cust_mst" generated at: ${expectedOutputPath}`,
    );

    const markdown = fs.readFileSync(expectedOutputPath, 'utf-8');
    const expectedMarkdown = `# Customer Master

The master table for customer data

## Columns

| Business Name | Description | Data Type | Business Rules |
|---|---|---|---|
| Customer ID | Unique identifier for a customer | INTEGER |  |
`;
    expect(markdown).toEqual(expectedMarkdown);
  });

  it('should exit with an error if the table is not found', () => {
    const yamlContent = `
tables:
  another_table:
    businessName: Another Table
    description: "Some other table"
    columns: {}
`;
    fs.writeFileSync(contractPath, yamlContent);

    expect(() =>
      runScript([
        '--table',
        'non_existent_table',
        '--contract',
        contractPath,
        '--output',
        generatedDir,
      ]),
    ).toThrowError(/Table "non_existent_table" not found in the data contract./);
  });

  it('should exit with an error for invalid YAML', () => {
    fs.writeFileSync(contractPath, 'invalid: yaml:');

    expect(() =>
      runScript([
        '--table',
        'any_table',
        '--contract',
        contractPath,
        '--output',
        generatedDir,
      ]),
    ).toThrowError(/Error parsing YAML file:/);
  });

  it('should exit with an error if the data contract file is not found', () => {
    // Don't write the contract file
    expect(() =>
      runScript([
        '--table',
        'any_table',
        '--contract',
        'non-existent-contract.yml',
        '--output',
        generatedDir,
      ]),
    ).toThrowError(/Data contract file not found at:/);
  });
});
