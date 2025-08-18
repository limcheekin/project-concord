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

import * as yaml from 'js-yaml';
import { Table, DataContract } from './reader.js';

/**
 * Parses the YAML content of a data contract.
 * This is a pure function with no file I/O.
 * @param yamlContent The string content of the datacontract.yml file.
 * @returns The parsed data contract object.
 */
export function parseDataContract(yamlContent: string): DataContract {
  return yaml.load(yamlContent) as DataContract;
}

/**
 * Gets the data for a specific table from the data contract.
 * @param contract The parsed data contract.
 * @param tableName The name of the table to retrieve.
 * @returns The table data, or undefined if the table is not found.
 */
export function getDataContractTable(contract: DataContract, tableName: string): Table | undefined {
  return contract.tables[tableName];
}


/**
 * Generates Markdown documentation for a given table.
 * @param tableData The data for the table.
 * @returns A Markdown string.
 */
export function generateMarkdown(tableData: Table): string {
  const { businessName, description, columns } = tableData;

  let markdownContent = `# ${businessName}\n\n`;
  markdownContent += `${description}\n\n`;
  markdownContent += `## Columns\n\n`;
  markdownContent += `| Business Name | Description | Data Type | Business Rules |\n`;
  markdownContent += `|---|---|---|---|\n`;

  for (const columnName in columns) {
    const column = columns[columnName];
    const businessRules = column.businessRules ? column.businessRules.join(', ') : '';
    markdownContent += `| ${column.businessName} | ${column.description} | ${column.dataType} | ${businessRules} |\n`;
  }

  return markdownContent;
}
