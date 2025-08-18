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

import * as path from 'path';
import { readDataContract } from './reader.js';

function validateDataContract() {
    console.log('Running validation for data contract...');
    // The script is run from the root of the 'packages/data-contract' directory
    const contractPath = path.join(process.cwd(), 'datacontract.yml');

    try {
        const data = readDataContract(contractPath);

        if (!data.tables) {
            throw new Error('Missing required top-level key: "tables"');
        }

        for (const tableName in data.tables) {
            const table = data.tables[tableName];
            if (!table.businessName) {
                throw new Error(`Table "${tableName}" is missing required key: "businessName"`);
            }
            if (!table.description) {
                throw new Error(`Table "${tableName}" is missing required key: "description"`);
            }
            if (!table.columns) {
                throw new Error(`Table "${tableName}" is missing required key: "columns"`);
            }

            for (const columnName in table.columns) {
                const column = table.columns[columnName];
                if (!column.businessName) {
                    throw new Error(`Column "${columnName}" in table "${tableName}" is missing required key: "businessName"`);
                }
                if (!column.description) {
                    throw new Error(`Column "${columnName}" in table "${tableName}" is missing required key: "description"`);
                }
                if (!column.dataType) {
                    throw new Error(`Column "${columnName}" in table "${tableName}" is missing required key: "dataType"`);
                }
            }
        }

        console.log('✅ Data contract validation successful!');
        process.exit(0);

    } catch (e: any) {
        console.error('❌ Data contract validation failed:');
        console.error(e.message);
        process.exit(1);
    }
}

validateDataContract();
