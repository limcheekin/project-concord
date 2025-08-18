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
import { parseDataContract, generateMarkdown, getDataContractTable } from './documentation-generator.js';

describe('Documentation Generator Logic', () => {
  const mockYamlContent = `
tables:
  CUST_MST:
    businessName: Customer Master
    description: Stores master information about customers.
    columns:
      c_id:
        businessName: Customer ID
        description: Unique identifier for a customer.
        dataType: INTEGER
        businessRules: []
      c_name:
        businessName: Customer Name
        description: Full name of the customer.
        dataType: VARCHAR(100)
        businessRules: []
`;

  it('should correctly parse the YAML string', () => {
    const dataContract = parseDataContract(mockYamlContent);
    expect(dataContract).toBeDefined();
    expect(dataContract.tables).toHaveProperty('CUST_MST');
  });

  it('should correctly get a table from the parsed contract', () => {
    const dataContract = parseDataContract(mockYamlContent);
    const tableData = getDataContractTable(dataContract, 'CUST_MST');
    expect(tableData).toBeDefined();
    expect(tableData?.businessName).toBe('Customer Master');
  });

  it('should return undefined for a non-existent table', () => {
    const dataContract = parseDataContract(mockYamlContent);
    const tableData = getDataContractTable(dataContract, 'NON_EXISTENT_TABLE');
    expect(tableData).toBeUndefined();
  });

  it('should correctly generate markdown from a table object', () => {
    const dataContract = parseDataContract(mockYamlContent);
    const tableData = getDataContractTable(dataContract, 'CUST_MST');

    const markdown = generateMarkdown(tableData!);

    const expectedMarkdown = `# Customer Master

Stores master information about customers.

## Columns

| Business Name | Description | Data Type | Business Rules |
|---|---|---|---|
| Customer ID | Unique identifier for a customer. | INTEGER |  |
| Customer Name | Full name of the customer. | VARCHAR(100) |  |
`;
    expect(markdown).toBe(expectedMarkdown);
  });
});
