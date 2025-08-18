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

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Helper to create a more readable business name from a snake_case physical name
export function prettify(text: string): string {
    return text
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Main function to generate the data contract
export function generateDataContract(auditPath: string, contractPath: string): void {
    console.log('Generating data contract from audit results...');

    try {
        // Read and parse the audit results
        const auditResults = JSON.parse(fs.readFileSync(auditPath, 'utf8'));

        // Transform the audit data into the data contract format
        const tables = auditResults.tables.reduce((acc: any, table: any) => {
            const tableName = table.tableName;
            acc[tableName] = {
                businessName: prettify(tableName),
                description: `Description for ${prettify(tableName)}`,
                columns: table.columns.reduce((colAcc: any, column: any) => {
                    const columnName = column.columnName;
                    colAcc[columnName] = {
                        businessName: prettify(columnName),
                        description: `Description for ${prettify(columnName)}`,
                        dataType: column.dataType,
                    };
                    return colAcc;
                }, {}),
            };
            return acc;
        }, {});

        const dataContract = {
            tables,
        };

        // Convert the JavaScript object to a YAML string
        const yamlString = yaml.dump(dataContract, { indent: 2 });

        // Write the YAML string to the datacontract.yml file
        fs.writeFileSync(contractPath, yamlString, 'utf8');

        console.log(`✅ Data contract generated successfully at: ${contractPath}`);

    } catch (e: any) {
        console.error('❌ Failed to generate data contract:');
        console.error(e.message);
        throw e;
    }
}

import { fileURLToPath } from 'url';

// This block will only run when the script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    // The script is run from the root of the 'packages/data-contract' directory
    const auditPath = path.join(process.cwd(), '../../', 'audit-results.json');
    const contractPath = path.join(process.cwd(), 'datacontract.yml');
    generateDataContract(auditPath, contractPath);
}
